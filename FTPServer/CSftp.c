#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include "usage.h"
#include <stdlib.h>
#include <netinet/in.h>
#include "dir.h"
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <ctype.h>




// Here is an example of how to use the above function. It also shows
// one how to get the arguments passed on the command line.
char * trim(char * str);
int checkCommandCount(char str []);
int containsInvalidInput(char * str);
char * checkParameterCount(char * str,int socket);
int isNoParameters(char *str, int clientSocket);


int main(int argc, char **argv) {



    int i;
    int loggedIn = 0;


    // Check the command line arguments
    if (argc != 2) {
        usage(argv[0]);
        return -1;
    }

    int portNumber = atoi(argv[1]);

    // Create socket for server to accept control connections on
    int sock;
    int dataSocket = -1;
    sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (sock == -1) {
        printf("Socket connection failed");
        return -1;
    }

    struct sockaddr_in serverAddr, clientAddr, dataClientAddr;
    bzero((char *) &serverAddr, sizeof(serverAddr));
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(portNumber);

    //if the bind fails make user run program again with new port number. Most likely cause.
    int bindConnection = bind(sock, (struct sockaddr *) &serverAddr, sizeof(struct sockaddr_in));
    if (bindConnection == -1) {
        printf("Bind Failed.  Try another port number.\n");
        return -1;
    }

    int listenForConnection = listen(sock, 1);
    if (listenForConnection == -1) {
        printf("Error occured when attempting to listen");
        return -1;
    }

    int size = sizeof(struct sockaddr_in);
    //Endless loop that will keep accepting connections. To stop must shut down program on command line.
    while(1) {
        //accept client connection
        int clientSock = accept(sock, (struct sockaddr *) &clientAddr, (socklen_t *) &size);

        if (clientSock == -1) {
            printf("Error occured when attempting to accept connection");
            continue;
        }

        char *message = "220 Connection Established\r\n";
        char clientBuffer[256];
        char *clientMessage;
        send(clientSock, message, strlen(message), 0);
        char cwd[1024];
        getcwd(cwd, sizeof(cwd));

        //Read commands until the user types in quit
        while (1) {
            //Revieve the commmand
            bzero(clientBuffer, 256);
            int n = (int) recv(clientSock, clientBuffer, 255, 0);

            if (n == -1) {
                message = "500 Error Reading Command. May be to Long\r\n";
                send(clientSock, message, strlen(message), 0);
              
                continue;
            }

            //Make sure client only inputed 2 arguments
            char testArray[256];
            strncpy(testArray, clientBuffer, 256);
            if (checkCommandCount(testArray) == -1) {
                message = "501 Syntax Error in Parameters or Arguments.\r\n";
                send(clientSock, message, strlen(message), 0);
                continue;
            };
            //trim white space and set clientMessage
            trim(clientBuffer);
            clientMessage = strtok(clientBuffer, " ");

            //convert message to uppercase
            char *s = clientMessage;
            while (*s) {
                *s = toupper((unsigned char) *s);
                s++;
            }

            //Handle user command
            if (strcmp(clientMessage, "USER") == 0) {
                //Check for not enough arguements
                clientMessage = checkParameterCount(clientMessage, clientSock);

                if (strcmp(clientMessage, "") == 0) {
                    continue;
                }


                if (loggedIn) {
                    message = "200 You are already logged in\r\n";
                    send(clientSock, message, strlen(message), 0);

                } else if (strcmp(clientMessage, "cs317") == 0) {
                    message = "230 Successful Login\r\n";
                    send(clientSock, message, strlen(message), 0);
                    loggedIn = 1;

                } else {
                    message = "430 Wrong Username\r\n";
                    send(clientSock, message, strlen(message), 0);
                }
            }

            else if (!loggedIn) {
                message = "530 Login Required First\r\n";
                send(clientSock, message, strlen(message), 0);
            }

            //handle changing directories
            else if (strcmp(clientMessage, "CWD") == 0) {
                //Check for two few arguements
                clientMessage = checkParameterCount(clientMessage, clientSock);
                if (strcmp(clientMessage, "") == 0) {
                    continue;
                }

                //check to see if the arguement contains ./ or ../
                if (containsInvalidInput(clientMessage) == 1) {
                    message = "504 Requested Action Not Taken. Parameter Not Allowed.\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }
                char cwd2[1024];

                getcwd(cwd2, sizeof(cwd2));

                //dont let client go past root dir
                if (strcmp(clientMessage, "..") == 0 && strcmp(cwd, cwd2) == 0) {
                    message = "550 Requested Action Not Taken. Directory Unavailable (No Access)\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                int changeDir = chdir(clientMessage);
                if (changeDir == -1) {
                    message = "550 Requested Action Not Taken. Directory Unavailable\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else {
                    message = "250 Changed Directories\r\n";
                    send(clientSock, message, strlen(message), 0);
                }


            }

            //Handle CDUP command
            else if (strcmp(clientMessage, "CDUP") == 0) {
                char cwd2[1024];
                //make sure there is no extra arguements
                if (isNoParameters(clientMessage, clientSock) == 0) {
                    continue;
                }
                getcwd(cwd2, sizeof(cwd2));

                //dont let client go past root dir
                if (strcmp(cwd2, cwd) == 0) {
                    message = "550 Requested Action Not Taken. Directory Unavailable (No Access)\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                chdir("..");
                message = "250 Changed Directories\r\n";
                send(clientSock, message, strlen(message), 0);
            }

            //Handle Type Command
            else if (strcmp(clientMessage, "TYPE") == 0) {
                //check for too few arguements
                clientMessage = checkParameterCount(clientMessage, clientSock);
                if (strcmp(clientMessage, "") == 0) {
                    continue;
                }
                if (strcmp(clientMessage, "I") == 0) {
                    message = "200 Now in Image Mode\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else if (strcmp(clientMessage, "A") == 0) {
                    message = "200 Now in ASCII Mode\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else{
                    message = "504 Type Not Supported\r\n";
                    send(clientSock, message, strlen(message), 0);
                }

            }

            //Handle Mode Command
            else if (strcmp(clientMessage, "MODE") == 0) {
                //check for too few arguements
                clientMessage = checkParameterCount(clientMessage, clientSock);
                if (strcmp(clientMessage, "") == 0) {
                    continue;
                } 
                if (strcmp(clientMessage, "S") == 0) {
                    message = "200 Now In Stream Mode\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else {
                    message = "504 Mode Not Supported\r\n";
                    send(clientSock, message, strlen(message), 0);
                }
            }

            //Handle STRU command
            else if (strcmp(clientMessage, "STRU") == 0) {
                clientMessage = checkParameterCount(clientMessage, clientSock);
                if (strcmp(clientMessage, "") == 0) {
                    continue;
                }
                if (strcmp(clientMessage, "F") == 0) {
                    message = "200 Now In File mode\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else {
                    message = "504 Structure Type Not Supported\r\n";
                    send(clientSock, message, strlen(message), 0);
                }
            }

            //Handle PASV command
            else if (strcmp(clientMessage, "PASV") == 0) {
                //check to see if to many arguements
                if (isNoParameters(clientMessage, clientSock) == 0) {
                    continue;
                }

                //create the data socket and start listening
                dataSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
                if (dataSocket == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                struct sockaddr_in dataServerAddr;
                bzero((char *) &dataServerAddr, sizeof(dataServerAddr));
                int dataPort;
                unsigned long dataIp;


                dataServerAddr.sin_addr.s_addr = INADDR_ANY;
                dataServerAddr.sin_family = AF_INET;
                dataServerAddr.sin_port = 0;

                int bindDataConnection = bind(dataSocket, (struct sockaddr *) &dataServerAddr,
                                              sizeof(struct sockaddr_in));
                if (bindDataConnection == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    close(dataSocket);
                    continue;
                }

                int listenForDataConnection = listen(dataSocket, 1);
                if (listenForDataConnection == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    close(dataSocket);
                    continue;
                }

                //Get port number of data connection so we can tell client
                if (getsockname(dataSocket, (struct sockaddr *) &dataServerAddr, (socklen_t *) &size) == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    close(dataSocket);
                    continue;
                } else {
                    dataPort = ntohs(dataServerAddr.sin_port);

                }
                //Get IP of clientSocket so we can connect data connection with it.
                if (getsockname(clientSock, (struct sockaddr *) &clientAddr, (socklen_t *) &size) == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    close(dataSocket);
                    continue;
                } else {
                    dataIp = clientAddr.sin_addr.s_addr;

                }

                //format and send info needed to user
                int one = (int) dataIp & 0xFF;
                int two = (int) (dataIp >> 8) & 0XFF;
                int three = (int) (dataIp >> 16) & 0xFF;
                int four = (int) (dataIp >> 24) & 0XFF;
                int port1 = dataPort / 256;
                int port2 = dataPort % 256;

                char *passive = "227 - Entering Passive Mode";

                char messageBuffer[1024];
                sprintf(messageBuffer, "%s (%d,%d,%d,%d,%d,%d)\r\n", passive, one, two, three, four, port1, port2);
                message = messageBuffer;
                send(clientSock, message, strlen(message), 0);

            }

            //Handle NLST command
            else if (strcmp(clientMessage, "NLST") == 0) {
               //Make sure passive mode is on
                if (dataSocket == -1) {
                    message = "425 Must Use Passive First\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }
                //make sure correct number of arguements
                if (isNoParameters(clientMessage, clientSock) == 0) {
                    continue;
                }
                //accept the clients data socket
                int clientDataSock = accept(dataSocket, (struct sockaddr *) &dataClientAddr, (socklen_t *) &size);

                if (clientDataSock == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                //Send directory listing and close connections.
                char cwd2[1024];
                getcwd(cwd2, sizeof(cwd2));

                message = "150 Here Comes the Directory Listing.\r\n";
                send(clientSock, message, strlen(message), 0);
                listFiles(clientDataSock, cwd2);
                message = "226 Transfer Complete.\r\n";
                send(clientSock, message, strlen(message), 0);

                close(dataSocket);
                dataSocket = -1;
                close(clientDataSock);

            }

            //Handle RETR command
            else if (strcmp(clientMessage, "RETR") == 0) {
                //Make sure passive mode is on
                if (dataSocket == -1) {
                    message = "425 Must Use Passive First\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                //Make sure correct number of arguements
                clientMessage = checkParameterCount(clientMessage, clientSock);
                if (strcmp(clientMessage, "") == 0) {
                    continue;
                }

                //Accept data connection
                int clientDataSock = accept(dataSocket, (struct sockaddr *) &dataClientAddr, (socklen_t *) &size);

                if (clientDataSock == -1) {
                    message = "425 Data Connection Failed\r\n";
                    send(clientSock, message, strlen(message), 0);
                    continue;
                }

                //If file is found read from file byte by byte and send over the data connection.
                FILE *file = fopen(clientMessage, "r");


                if (file == NULL) {
                    message = "550 Requested Action Not Taken. File Unavailable\r\n";
                    send(clientSock, message, strlen(message), 0);
                } else {
                    int byte;
                    while ((byte = fgetc(file)) != EOF) {
                        send(clientDataSock, &byte, 1, 0);
                    }
                    fclose(file);
                }

                //close connections
                close(dataSocket);
                dataSocket = -1;
                close(clientDataSock);

            }

            //Handle QUIT command
            else if (strcmp(clientMessage, "QUIT") == 0) {
                //close connections
                message = "221 Goodbye\r\n";
                loggedIn = 0;
                send(clientSock, message, strlen(message), 0);
                close(dataSocket);
                close(clientSock);
                break;
            }

            //Handle Unknown Command
            else{
                message = "500 Unknown Command\r\n";
                send(clientSock, message, strlen(message), 0);
            }
        }
    }





}

char *  trim(char * str){
    char * trailing = str + strlen(str) - 1;
    while(trailing > str && isspace((unsigned char) *trailing)) trailing--;

    // Write new null terminator
    *(trailing+1) = 0;

    return str;
}

int checkCommandCount(char str []){
    char *clientMessage = strtok(str, " ");
    int count = 0;
    while (clientMessage != NULL)
    {
        clientMessage = strtok (NULL, " ");
        count ++;
        if(count > 2){
            return -1;
        }
    }
    return 1;
}

char * checkParameterCount(char * str,int clientSocket){
    if((str = strtok(NULL, " ")) == NULL){
        char * message = "501 Syntax Error in Parameters or Arguments.\r\n";
        send(clientSocket, message, strlen(message), 0);
        return "";
    }
    return str;
}
int isNoParameters(char *str, int clientSocket){
    if((str = strtok(NULL, " ")) == NULL){
        return 1;
    }
    char * message = "501 Syntax Error in Parameters or Arguments.\r\n";
    send(clientSocket, message, strlen(message), 0);
    return 0;
}

int containsInvalidInput(char * str){
    if(strstr(str, "./") != NULL){
        return 1;
    }
    return 0;
}

