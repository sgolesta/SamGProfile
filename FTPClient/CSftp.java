import java.lang.System;
import java.io.IOException;
import java.net.*;
import java.net.Socket;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.*;
import java.util.ArrayList;

//
// This is an implementation of a simplified version of a command
// line ftp client. The program always takes two arguments
//
// add list of features if not in the list return not enough arguments.  Update filenot found exception.
// For out puting line use print and flush and add /r/n and the end
// for reading from the server read until readline = "" to get rid of the timeout.
// make netcat server if possible to test.


public class CSftp {
    static final int MAX_LEN = 255;
    static final int ARG_CNT = 2;
    static BufferedReader in;
    static Socket socket ;
    static PrintWriter out;
    static BufferedReader stdIn = new BufferedReader( new InputStreamReader(System.in));
    static String hostName;
    static int portNumber;

    public static void main(String [] args) {
        // Create and add list of features that our ftp client implements
        ArrayList<String> features = new ArrayList<>();
        features.add("dir");
        features.add("cd");
        features.add("get");
        features.add("user");
        features.add("pw");
        features.add("quit");
        features.add("features");

        // Get command line arguments and connected to FTP
        // If the arguments are invalid or there aren't enough of them
        // then exit.
        if (args.length != ARG_CNT) {
            System.out.print("Usage: cmd ServerAddress ServerPort\n");
            return;
        }

        hostName = args[0];
        portNumber = Integer.parseInt(args[1]);

        try {
            // Create new connection
            socket = new Socket();
            InetSocketAddress i = new InetSocketAddress(hostName,portNumber);
            socket.connect(i,20000);
            out = new PrintWriter(socket.getOutputStream(), true);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            socket.setSoTimeout(200);
            getServerFeedback(in);
        }
        catch (SocketTimeoutException e) {
            // Connection failed
            System.out.println("0xFFFC Control connection to " + hostName +  " on port " + portNumber + " failed to open.");
            System.exit(1);
        }
        catch (IOException e){
            // Connection failed
            System.out.println("0xFFFC Control connection to " + hostName +  " on port " + portNumber + " failed to open.");
            System.exit(1);
        }
        catch(Exception e){
            // There was a processing error
            System.out.println("0xFFFF Processing error. " +  e);
            System.exit(1);
        }

        try {
            for (int len = 1; len > 0;) {
                // Print command prompt
                System.out.print("csftp> ");

                // Read the input command
                String command = stdIn.readLine();

                // Split the input command
                String [] input = command.split("\\s+");

                // Check input length
                if (input.length > 2) {
                    // An incorrect number of arguments were typed
                    System.out.println("0x002 Incorrect number of arguments");
                    continue;
                }

                // Silently ignore empty commands and inputs that begin with '#'
                if (input.length == 0  || command.length() == 0||input[0].charAt(0) == '#') {
                    continue;
                }

                if(!features.contains(input[0])){
                    // If the commands aren't ones specified in features print out error
                    System.out.println("0x001 Invalid command");
                    continue;
                }
                // Input is valid so therefore run it
                runCommand(input);
            }
        }
        catch (IOException exception) {
            System.err.println("998 Input error while reading commands, terminating.");
            closeSocket();
        }
        catch(Exception e){
            System.out.println("0xFFFF Processing error. " +  e);
            closeSocket();
        }
    }


    public static void runCommand(String[] args) throws Exception{
        // Iterate through and check to see which command was input
        // then implement associated function of command
        try {
            if (args[0].equals("features")) {
                out.print("FEAT\r\n");
                out.flush();
                System.out.println("--> FEAT\r\n");
                getServerFeedback(in);
            }
            else if (args[0].equals("quit")) {
                out.print("QUIT\r\n");
                out.flush();
                System.out.println("--> QUIT\r\n");
                getServerFeedback(in);
                closeSocket();
            }
            else if (args[0].equals("dir")) {
                args[0] = "LIST";
                System.out.println("--> LIST\r\n");
                passiveMode(args);
            }
            else if (args.length == 1){
                System.out.println("0x002 Incorrect number of arguments");
                return;
            }
            else if (args[0].equals("user")) {
                out.print("USER " + args[1] + "\r\n");
                out.flush();
                System.out.println("--> USER " + args[1] + "\r\n");
                getServerFeedback(in);
            }
            else if (args[0].equals("pw")) {
                out.print("PASS " + args[1]  + "\r\n");
                out.flush();
                System.out.println("--> PASS " + args[1] + "\r\n");
                getServerFeedback(in);
            }
            else if (args[0].equals("cd")) {
                out.print("CWD " + args[1] + "\r\n");
                out.flush();
                System.out.println("CWD " + args[1] + "\r\n");
                getServerFeedback(in);
            }
            else if (args[0].equals("get")) {
                args[0] = "RETR";
                System.out.println("--> RETR " + args[1] + " \r\n");
                getServerFeedback(in);
                passiveMode(args);
            }
        } catch(IOException e) {
            System.out.println("0xFFFD Control connection I/O error, closing control connection.");
            closeSocket();;
        }
    }


    public static void passiveMode(String [] command) throws Exception, IOException{
        // Entering passive mode
        out.print("PASV\r\n");
        out.flush();
        String connection = getServerFeedback(in);
        int startingIndex = connection.indexOf("(")+1;
        int endingIndex = connection.indexOf(")");
        // retrieve the ip address given in the string in position starting index to ending index
        connection = connection.substring(startingIndex,endingIndex);
        String [] host = connection.split(",");
        // Create the proper IP address representation
        String IP = host[0] + "." +  host[1] + "." +  host[2] + "." + host[3];
        // Calculation for the port #
        int port = Integer.parseInt(host[4]) * 256 + Integer.parseInt(host[5]);

        InputStream inStream;
        BufferedReader dataIn;
        Socket dataSocket;

        try {
            // Create open data transfer connection with host
            dataSocket = new Socket();
            InetSocketAddress i = new InetSocketAddress(IP,port);
            dataSocket.connect(i,10000);
            inStream = dataSocket.getInputStream();
            dataIn = new BufferedReader(new InputStreamReader(dataSocket.getInputStream()));
        }
        catch (SocketTimeoutException e) {
            // Data transfer connection failed to open
            System.out.println("0x3A2 Data transfer connection to " + IP + " on port "  + port + " failed to open.");
            System.out.println("dsf");
            return;
        }
        catch (IOException e){
            // Data transfer connection failed to open
            System.out.println("0x3A2 Data transfer connection to " + IP + " on port "  + port + " failed to open.");
            return;
        }

        // Check to see if command is "LIST"
        if(command[0].equals("LIST")) {
            // In passive mode, retrieve the list of files in the current working directory
            out.print("LIST\r\n");
            out.flush();
            getServerFeedback(in);
            getServerFeedback(dataIn);
        }
        // Otherwise check to see if command is "RETR"
        else if(command[0].equals("RETR")) {
            // Get the file specified by command[1] and call writeToFile to save it on local machine
            out.print("TYPE I\r\n");
            out.flush();
            out.print("RETR " + command[1] + "\r\n");
            out.flush();
            getServerFeedback(in);
            writeToFile(inStream,command[1]);
            getServerFeedback(in);
        }
        // Close open data transfer connection
        dataSocket.close();
        dataIn.close();
        inStream.close();
    }


    public static void writeToFile(InputStream br, String fileName) throws Exception {
        // Write the file as provided to function by fileName

        try {
            File file = new File(fileName);
            FileOutputStream fos = new FileOutputStream(fileName);
            byte[] bytes = new byte[16 * 1024];

            int count;
            while ((count = br.read(bytes)) > 0) {
                fos.write(bytes, 0, count);
            }
            // Close the Output Stream
            fos.close();
        }
        catch(FileNotFoundException e) {
            // File wasn't found
            System.out.println("0x38E Access to local file " + fileName + " denied.");
        }
        catch(IOException e){
            // Open data transfer connection error occured while read/write
            System.out.println("0x3A7 Data transfer connection I/O error, closing data connection.");
        }
    }


    public static String getServerFeedback(BufferedReader br) throws Exception {
        String serverInput = "";

        try {
            // Keep retrieving server input while input available
            while ((serverInput = br.readLine()) != null) {
                // If br is open control connection use incoming prefix for the server input
                if(br == in) {
                    System.out.println("<--" + serverInput);
                } else{
                    // otherwise data connection so just display server input
                    System.out.println(serverInput);
                }
            }
        } catch (SocketTimeoutException e) {
            // Timeout occured
        } catch(IOException e) {

            if(br == in) {
                // Control connection error occured
                System.out.println("0xFFFD Control connection I/O error, closing control connection.");
                closeSocket();
            }
            else {
                // Data connection error occured
                System.out.println("0x3A7 Data transfer connection I/O error, closing data connection.");
            }
        }
        // Return the value for serverInput that will be used for things
        // such as retrieving IP string in data connection
        return serverInput;
    }


    public static void closeSocket() {
        // CLose the connection with host
        try {
            socket.close();
            in.close();
            out.close();
            stdIn.close();
            System.exit(0);
        } catch (IOException e) {
            System.exit(0);
        }
    }
}