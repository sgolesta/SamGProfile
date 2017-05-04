
import java.net.InetAddress;
import java.util.*;




// Lots of the action associated with handling a DNS query is processing
// the response. Although not required you might find the following skeleton of
// a DNSreponse helpful. The class below has bunch of instance data that typically needs to be
// parsed from the response. If you decide to use this class keep in mind that it is just a
// suggestion and feel free to add or delete methods to better suit your implementation as
// well as instance variables.



public class DNSResponse {
    private int queryID;                  // this is for the response it must match the one in the request
    private int answerCount = 0;          // number of answers
    private boolean decoded = false;      // Was this response successfully decoded
    private int nsCount = 0;              // number of nscount response records
    private int additionalCount = 0;      // number of additional (alternate) response records
    private boolean authoritative = false;// Is this an authoritative record
    byte [] data;
    private int cFQDNLength;
    // Note you will almost certainly need some additional instance variables.
    private int AA;
    private int TC;
    private int RD;
    private static final int HEADER_LENGTH = 12;
    private int RA;
    private int RCODE;
    private int QDCount;
    private ArrayList<DNSRecord> nameServers = new ArrayList();
    private ArrayList<DNSRecord> answers = new ArrayList();
    private ArrayList<DNSRecord> additionalInfo = new ArrayList();
    private int globalReference = 0;  // this will be our reference to where we are in the byte array recieved from the datagram packet
    private int savedIndex = -1;
    // When in trace mode you probably want to dump out all the relevant information in a response


    // The constructor: you may want to add additional parameters, but the two shown are
    // probably the minimum that you need.

    public DNSResponse (byte[] data, int len, int questionLength) {

        // The following are probably some of the things
        // you will need to do.
        // Extract the query ID
        this.data = data;
        queryID = (Byte.toUnsignedInt(data[0]) << 8) + Byte.toUnsignedInt(data[1]);


        // Make sure the message is a query response and determine
        // if it is an authoritative response or note
        byte indicationBits = data[2];

        int responseBit = Byte.toUnsignedInt(indicationBits) >> 7;

        if (responseBit == 1) {
            // then a response
            AA = ((indicationBits & 0x7) >> 2);
            TC = ((indicationBits & 0x3) >> 1);
            RD = (indicationBits & 0x1);
        }

        byte responseCodeBits = data[3];

        RA = (responseCodeBits >> 7);
        RCODE = responseCodeBits & 0xf;

        // determine QDCount
        QDCount = (Byte.toUnsignedInt(data[4]) << 8) + Byte.toUnsignedInt(data[5]);
        // determine answer count

        answerCount = (Byte.toUnsignedInt(data[6]) << 8) + Byte.toUnsignedInt(data[7]);
        // determine NS Count

        nsCount = (Byte.toUnsignedInt(data[8]) << 8) + Byte.toUnsignedInt(data[9]);
        // determine additional record count

        additionalCount = (Byte.toUnsignedInt(data[10]) << 8) + Byte.toUnsignedInt(data[11]);
        // Extract list of answers, name server, and additional information response
        // records
        globalReference = HEADER_LENGTH + questionLength + 5;


        for(int i = 0; i < answerCount; i++) {
            DNSRecord record = getServerInfo();


            answers.add(record);
        }
        for(int i = 0; i < nsCount; i++) {
            DNSRecord record = getServerInfo();

            nameServers.add(record);
        }
        for(int i = 0; i < additionalCount; i++) {
            DNSRecord  record = getServerInfo();

            additionalInfo.add(record);
        }

    }


    private DNSRecord getServerInfo(){
        DNSRecord record = parseData();

        int RDLength = (Byte.toUnsignedInt(data[globalReference + 8]) <<8) + Byte.toUnsignedInt(data[globalReference + 9]);
        record.setRDLength(RDLength);
        // if the address is ipv4
        if(record.getType() == 1) {
            int bit1 = Byte.toUnsignedInt(data[globalReference + 10]);
            int bit2 = Byte.toUnsignedInt(data[globalReference + 11]);
            int bit3 = Byte.toUnsignedInt(data[globalReference + 12]);
            int bit4 = Byte.toUnsignedInt(data[globalReference + 13]);
            String RData = bit1 + "." + bit2 + "." + bit3 + "." + bit4;
            record.setRData(RData);
            globalReference += 14;
        }
        // if the address is ipv6
        else if(record.getType() == 28){
            int hex1 = (Byte.toUnsignedInt(data[globalReference + 10]) << 8) + Byte.toUnsignedInt(data[globalReference + 11]);
            int hex2 = (Byte.toUnsignedInt(data[globalReference + 12]) << 8) + Byte.toUnsignedInt(data[globalReference + 13]);
            int hex3 = (Byte.toUnsignedInt(data[globalReference + 14]) << 8) + Byte.toUnsignedInt(data[globalReference + 15]);
            int hex4 = (Byte.toUnsignedInt(data[globalReference + 16]) << 8) + Byte.toUnsignedInt(data[globalReference + 17]);
            int hex5 = (Byte.toUnsignedInt(data[globalReference + 18]) << 8) + Byte.toUnsignedInt(data[globalReference + 19]);
            int hex6 = (Byte.toUnsignedInt(data[globalReference + 20]) << 8) + Byte.toUnsignedInt(data[globalReference + 21]);
            int hex7 = (Byte.toUnsignedInt(data[globalReference + 22]) << 8) + Byte.toUnsignedInt(data[globalReference + 23]);
            int hex8 = (Byte.toUnsignedInt(data[globalReference + 24]) << 8) + Byte.toUnsignedInt(data[globalReference + 25]);
            String RData = Integer.toHexString(hex1) + ":" + Integer.toHexString(hex2) + ":" +
                    Integer.toHexString(hex3) + ":" + Integer.toHexString(hex4) + ":" +
                    Integer.toHexString(hex5) + ":" + Integer.toHexString(hex6) +  ":" +
                    Integer.toHexString(hex7) + ":"  + Integer.toHexString(hex8);
            record.setRData(RData);
            globalReference += 26;
        }
        //if the address is a cName or a nameserver
        else if(record.getType() == 5 || record.getType() == 2 ){

            globalReference+=10;
            String RData = getFQDN(globalReference,false);
            record.setRData(RData);
            //check if there was a pointer in the RData and set to globalReference accordingly
            if(savedIndex != -1) {
                globalReference = savedIndex;
                savedIndex = -1;
            }
        }
        return record;
    }


    private DNSRecord parseData(){
        //get domain name
        String name = getFQDN(globalReference, false);
        //check if there was a pointer in the Domain Name and set to globalReference accordingly
        if(savedIndex != -1) {
            globalReference = savedIndex;
            savedIndex = -1;
        }
        //extract the type the RDataClaa and the TTL from the datagram packet we recieved from the server
        int type = (Byte.toUnsignedInt(data[globalReference]) << 8) + Byte.toUnsignedInt(data[globalReference + 1]);
        int RDataClass = (Byte.toUnsignedInt(data[globalReference + 2]) << 8) + Byte.toUnsignedInt(data[globalReference + 3]);
        int TTL = (Byte.toUnsignedInt(data[globalReference + 4]) << 24) + (Byte.toUnsignedInt(data[globalReference + 5]) << 16)
                + (Byte.toUnsignedInt(data[globalReference + 6]) << 8) + Byte.toUnsignedInt(data[globalReference + 7]);
        //make a new record with the correcponding values
        DNSRecord record = new DNSRecord(name,type,RDataClass,TTL);
        return record;
    }


    private String getFQDN(int pointer, boolean isGlobalRefSet) {
        byte[] compressedFQDN = new byte[1024];

        int cFQDNLength= 0;
        if(data[pointer] == 0){
            pointer++;
        }
        //if first byte is 192 then its a pointer and we need to jump so save to correct reference
        if (Byte.toUnsignedInt(data[pointer]) == 192) {
            if(!isGlobalRefSet){
                savedIndex = pointer + 2;
            }
            return getFQDN(Byte.toUnsignedInt(data[pointer + 1]),true);
        }
        int lengthOfElement = Byte.toUnsignedInt(data[pointer]);
        int movingPointer = pointer;
        int index = 0;
        //extract the name using the datapacket bytes recvieved from the server
        while (Byte.toUnsignedInt(data[movingPointer]) != 0) {
            for (int i = movingPointer + 1; i <= movingPointer + lengthOfElement; i++) {
                compressedFQDN[index] = data[i];
                index++;
                cFQDNLength++;
            }
            compressedFQDN[index] = 0x2e;
            index++;
            cFQDNLength++;
            movingPointer += lengthOfElement + 1;
            //if next byte is 192 then its a pointer and we need to jump so save to correct reference
            if (Byte.toUnsignedInt(data[movingPointer]) == 192) {
                if(!isGlobalRefSet){
                    savedIndex = movingPointer + 2;
                }
                movingPointer = Byte.toUnsignedInt(data[movingPointer + 1]);
                byte[] copyRange = Arrays.copyOfRange(compressedFQDN, 0, cFQDNLength);
                //value of current domain name + value after the recursion
                return new String(copyRange) + getFQDN(movingPointer,true);
            }

            lengthOfElement = Byte.toUnsignedInt(data[movingPointer]);
        }
        // update our global reference to the correct byte
        globalReference = movingPointer +1;
        byte [] copyRange;
        // shorten array to correct value
        if(cFQDNLength > 0) {
            copyRange = Arrays.copyOfRange(compressedFQDN, 0, cFQDNLength - 1);
        }
        else{
            copyRange = Arrays.copyOfRange(compressedFQDN, 0, cFQDNLength );
        }
        //return domain name
        return new String(copyRange);
    }

    public ArrayList<DNSRecord> getAnswers(){ return answers;}

    public ArrayList<DNSRecord> getNameServers(){ return nameServers;}

    public ArrayList<DNSRecord> getAdditionalInfo(){ return additionalInfo;}

    public int getAA(){ return AA;}

    public int getRCODE(){ return RCODE;}

    public int getQueryID(){ return queryID;}

}


