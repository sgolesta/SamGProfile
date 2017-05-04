
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Random;
import java.io.*;
import java.net.DatagramPacket;
import java.util.*;
import java.net.SocketTimeoutException;

/**
 *
 */

/**
 * @author Donald Acton
 * This example is adapted from Kurose & Ross
 * Feel free to modify and rearrange code as you see fit
 */
public class DNSlookup {

    static int queryNumber = 0;
    static String queryName;
    static int queryType = 1;
    static InetAddress rootNameServer;
    static final int MIN_PERMITTED_ARGUMENT_COUNT = 2;
    static final int MAX_PERMITTED_ARGUMENT_COUNT = 3;

    /**
     * @param args
     */
    public static void main(String[] args) throws Exception {
        String fqdn;
        DNSResponse response; // Just to force compilation
        int argCount = args.length;
        boolean tracingOn = false;

        if (argCount < MIN_PERMITTED_ARGUMENT_COUNT || argCount > MAX_PERMITTED_ARGUMENT_COUNT) {
            usage();
            return;
        }
        // rootNameServer is IP address of Host
        rootNameServer = InetAddress.getByName(args[0]);
        // fqdn = name of the website to loopup (e.g. www.cs.ubc.ca)
        fqdn = args[1];

        if (argCount == 3) {  // option provided
            if (args[2].equals("-t"))
                tracingOn = true;
            else if (args[2].equals("-6"))
                queryType = 28;
            else if (args[2].equals("-t6")) {
                tracingOn = true;

                queryType = 28;
            } else  { // option present but wasn't valid option
                usage();
                return;
            }
        }


        // Start adding code here to initiate the lookup

        DatagramSocket datagramSocket = new DatagramSocket();
        datagramSocket.setSoTimeout(5000);

        resolverHandler(datagramSocket, queryType, tracingOn, rootNameServer, fqdn);
    }


    private static String resolverHandler(DatagramSocket socket, int type,
                                          boolean tracingOn, InetAddress server, String fqdn) throws IOException {
        // Save the first query Name
        if(queryNumber == 0){
            queryName = fqdn;
        }
        // If more than 30 queries report error
        if(queryNumber >= 29){
            System.out.println(queryName + " -3 " + "A" + " 0.0.0.0");
            System.exit(1);
        }
        queryNumber++;

        // Random QueryID Generator
        ByteArrayOutputStream query = new ByteArrayOutputStream(512);
        Random randGen = new Random();
        int queryID = randGen.nextInt(65536);

        byte[] queryIDBuf = new byte[2];

        randGen.nextBytes(queryIDBuf);

        // Write query ID
        query.write(queryIDBuf, 0, 2);

        // QUERY STATIC BYTES
        byte[] queryStaticBytes = new byte[10];
        queryStaticBytes[3] = 1;
        query.write(queryStaticBytes, 0, 10);


        // QNAME
        int questionLength = 0;
        String[] domainElements = fqdn.split("\\.");

        for (int i = 0; i < domainElements.length; i++) {
            // insert size of domain element in query
            int elementLength = domainElements[i].length();

            query.write(elementLength);
            questionLength += elementLength + 1;

            // convert domain element to bytes
            byte[] elementBytes = domainElements[i].getBytes();

            query.write(elementBytes, 0, elementBytes.length);
        }

        // QNAME ends
        query.write(0);

        // QTYPE
        query.write(0);

        query.write(type);

        // QCLASS
        query.write(0);
        query.write(1);

        byte[] queryBuf = query.toByteArray();

        // Create packet to send query to server
        DatagramPacket packet = new DatagramPacket(queryBuf, queryBuf.length, server, 53);
        DatagramPacket recievedPacket = null;

        // try sending the packet if failed send again
        // if failed again then indicate name couldn't be looked up
        byte[] responseBuf = new byte[1024];
        for (int i = 0; i < 2; i++) {
            try {
                socket.send(packet);
                recievedPacket= new DatagramPacket(responseBuf, responseBuf.length);
                // recieve packet
                socket.receive(recievedPacket);
            } catch (SocketTimeoutException e) {
                if (i == 1) {
                    // tryed sending query twice and failed
                    System.out.println(queryName + " -2 " + "A" + " 0.0.0.0");
                    System.exit(1);
                }
            } catch (IOException e) {

            }
        }

        // Extract response
        DNSResponse response = new DNSResponse(responseBuf, responseBuf.length,questionLength);
        int rQueryID = response.getQueryID();
        int rAA = response.getAA();
        int rRcode = response.getRCODE();
        ArrayList<DNSRecord> rAnswers = response.getAnswers();
        ArrayList<DNSRecord> rNameServers = response.getNameServers();
        ArrayList<DNSRecord> rAdditionalInfo = response.getAdditionalInfo();

        // Error Handling with different RCodes
        if(rRcode == 3){
            System.out.println(queryName + " -1 " + "A" + " 0.0.0.0");
            System.exit(1);
        }
        else if(rRcode !=0){
            System.out.println(queryName + " -4 " + "A" + " 0.0.0.0");
            System.exit(1);
        }
        else if(rRcode == 0 && rAnswers.size() == 0 && rAA == 1){
            System.out.println(queryName + " -6 " + "A" + " 0.0.0.0");
            System.exit(1);
        }

        // If Trace is on, printTrace
        if(tracingOn) {

            System.out.println("\n" + "\n" + "Query ID" + "     " + queryID + " " + fqdn + "  " +
                    getTypeString(queryType) + " " + "-->" + " " + server.getHostAddress());

            printTrace(queryID, rAA, rAnswers, rNameServers, rAdditionalInfo);
        }

        ArrayList<DNSRecord> answers = new ArrayList<>();
        for(int i = 0; i < rAnswers.size();i++){
            // if answers is not a CNAME in response add them to answers list
            if(rAnswers.get(i).getType() != 5){
                answers.add(rAnswers.get(i));
            }
        }
        // if there are answers print all of them
        if(answers.size() > 0){
            printAnswers(answers);
            return answers.get(0).getRData();
        }
        // there must be CNAMES so recurse on CNAME
        if(rAnswers.size() > 0){
            String ip = resolverHandler(socket, rAnswers.get(0).getType(),tracingOn,rootNameServer,rAnswers.get(0).getRData());
            return ip;
        }
        // Additional Info exist for Nameserver, recurse on that ip address
        if(rAdditionalInfo.size() != 0){
            DNSRecord nextQuery = null;
            // find first ipv4 address
            for(int i = 0; i < rAdditionalInfo.size(); i++){
                if(rAdditionalInfo.get(i).getType() == 1){
                    nextQuery = rAdditionalInfo.get(i);
                    break;
                }

            }
            String ip = resolverHandler(socket, queryType, tracingOn, InetAddress.getByName(nextQuery.getRData()),fqdn);
            return ip;
        }
        // Nameserver is a CNAME, get ip of CNAME and restart query with that as the root
        else{
            int savedType = queryType;
            queryType = 1;
            String ip = resolverHandler(socket, queryType, tracingOn, rootNameServer,rNameServers.get(0).getRData());
            queryType = savedType;
            resolverHandler(socket, queryType, tracingOn, InetAddress.getByName(ip),queryName);
            return ip;
        }
    }


    private static void printTrace(int queryId, int AA, ArrayList<DNSRecord> answers,
                                   ArrayList<DNSRecord> nameServers, ArrayList<DNSRecord> addtionalInfo) {
        boolean auth = true;
        if (AA == 0) {
            auth = false;
        } else if (AA == 1) {
            auth = true;
        }
        System.out.println("Response ID:" + " " + queryId + " " + "Authoratitive" + " " + auth);

        System.out.println("  " + "Answers" + " " + answers.size());

        for (int i = 0; i < answers.size(); i++) {
            String recordType = getTypeString(answers.get(i).getType());
            String recordValue = answers.get(i).getRData();
            String recordName = answers.get(i).getDomainName();
            int ttl = answers.get(i).getTTL();
            System.out.format("       %-30s %-10d %-4s %s\n", recordName, ttl, recordType, recordValue);
        }

        System.out.println("  " + "Nameservers" + " " + nameServers.size());

        for (int i = 0; i < nameServers.size(); i++) {
            String recordType = getTypeString(nameServers.get(i).getType());
            String recordValue = nameServers.get(i).getRData();
            String recordName = nameServers.get(i).getDomainName();
            int ttl = nameServers.get(i).getTTL();
            System.out.format("       %-30s %-10d %-4s %s\n", recordName, ttl, recordType, recordValue);
        }

        System.out.println("  " + "Additional Information" + " " + addtionalInfo.size());

        for (int i = 0; i < addtionalInfo.size(); i++) {
            String recordType = getTypeString(addtionalInfo.get(i).getType());
            String recordValue = addtionalInfo.get(i).getRData();
            String recordName = addtionalInfo.get(i).getDomainName();
            int ttl = addtionalInfo.get(i).getTTL();
            System.out.format("       %-30s %-10d %-4s %s\n", recordName, ttl, recordType, recordValue);
        }
    }


    private static void printAnswers(ArrayList<DNSRecord> answers){
        for(int i = 0; i < answers.size();i++){
            System.out.println(queryName + " " + answers.get(i).getTTL() + " "
                    + getTypeString(answers.get(i).getType()) +  " " + answers.get(i).getRData());
        }
    }


    private static String getTypeString(int type){
        if(type == 5){
            return "CN";
        }
        if(type == 2){
            return "NS";
        }
        if(type == 1){
            return "A";
        }
        if(type == 28){
            return "AAAA";
        }
        else{
            return Integer.toString(type);
        }
    }

    private static void usage() {
        System.out.println("Usage: java -jar DNSlookup.jar rootDNS name [-6|-t|t6]");
        System.out.println("   where");
        System.out.println("       rootDNS - the IP address (in dotted form) of the root");
        System.out.println("                 DNS server you are to start your search at");
        System.out.println("       name    - fully qualified domain name to lookup");
        System.out.println("       -6      - return an IPV6 address");
        System.out.println("       -t      - trace the queries made and responses received");
        System.out.println("       -t6     - trace the queries made, responses received and return an IPV6 address");
    }

}