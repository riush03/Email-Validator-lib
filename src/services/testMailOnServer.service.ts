import { error } from "node:console"
import net from "node:net"

enum SMTPConfNames {
    CHECK_CONNECTION_ESTABLISHED = 'CHECK_CONNECTION_ESTABLISHED',
    SEND_EHLO = 'SEND_EHLO',
    SEND_MAIL_FROM = 'SEND_MAIL_FROM',
    SEND_RECIPIENT_TO = 'SEND_RECIPIENT_TO'
}

export type TTestInboxResults = {
    connection_succeeded: boolean,
    inbox_exists: boolean
}

export const testMailOnServer =async (smtpHostname:string,mailInbox:string) => {
    return new Promise((resolve,reject) => {
        const result = {
            connection_succeeded:false,
            inbox_exists:false
        }

        const socket = net.createConnection(25,smtpHostname)
        let currentConfName: SMTPConfNames = SMTPConfNames.CHECK_CONNECTION_ESTABLISHED

        socket.on('data',(data:Buffer) => {
            const response = data.toString('utf-8')
            console.log('<===== '+response)

            switch(currentConfName){
                case SMTPConfNames.CHECK_CONNECTION_ESTABLISHED: {
                    const expectedReplyCode = '220'
                    const nextConfName = SMTPConfNames.SEND_EHLO
                    const command = 'EHLO mail.example.org\r\n'

                    if(!(response.startsWith(expectedReplyCode))) {
                        console.error(response)
                        socket.end()
                        return resolve(result)
                    }

                    result.connection_succeeded = true

                    socket.write(command,()=> {
                        console.log('===>'+command)
                        currentConfName = nextConfName
                    })

                    break
                }

                    case SMTPConfNames.SEND_EHLO: {
                        const expectedReplyCode = '250'
                        const nextConfName = SMTPConfNames.SEND_MAIL_FROM
                        const command = 'MAIL FROM:<example@mail.org>\r\n'
    
                        if(!(response.startsWith(expectedReplyCode))) {
                            socket.end()
                            return resolve(result)
                        }
    
    
                        socket.write(command,()=> {
                            console.log('===>'+command)
                            currentConfName = nextConfName
                        })
    
                        break

                }

                        case SMTPConfNames.SEND_MAIL_FROM: {
                            const expectedReplyCode = '250'
                            const nextConfName = SMTPConfNames.SEND_RECIPIENT_TO
                            const command = 'RCPT TO:<${emailInbox}>\r\n'
                            
                            if(!(response.startsWith(expectedReplyCode))) {
                                socket.end()
                                return resolve(result)
                            }
                            
                            
                            socket.write(command,()=> {
                                console.log('===>'+command)
                                currentConfName = nextConfName
                        })

                        break

               }

                        case SMTPConfNames.SEND_RECIPIENT_TO: {
                            const expectedReplyCode = '250'
                            const command = 'QUIT\r\n'
                            
                            if(!(response.startsWith(expectedReplyCode))) {
                                socket.end()
                                return resolve(result)
                            }
                            
                            result.inbox_exists = true
                            
                            socket.write(command,()=> {
                                console.log('===>'+command)
                                socket.end()
                                return resolve(result)
                        })

               }

                       
            }
        })

        socket.on('error',(err:Error) => {
            console.error(error)
            reject(err)
        })

        socket.on('connect',() => {
            console.log('Connected to:'+smtpHostname)
        })
    })
}