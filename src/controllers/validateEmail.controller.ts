import { error } from "console"
import { Request,Response,NextFunction } from "express"
import { validateEmailFormat } from "../services/validateEmailFormat.service"
import { resolveMxRecords } from "../services/resolveMxRecords.service"
import { randomBytes } from "node:crypto"
import { TTestInboxResults, testMailOnServer } from "../services/testMailOnServer.service"
import { json } from "body-parser"

export const validateEmail  = async (req:Request,res:Response,next:NextFunction) => {
    if(!(req.body?.email)){
        res.status(400).json({error:'missing email'})
        return next()
    }

    const emailFormatIsValid = validateEmailFormat(req.body.email)
    if(!emailFormatIsValid) {
        res.status(400).json({error:'the email format is not valid'})
        return next()
    }

    const [, domain] = req.body.email.split('@')

    const mxRecords = await resolveMxRecords(domain)
    const sortedMxRecords = mxRecords.sort((a, b) => a.priority - b.priority)

    let smtpResult: TTestInboxResults = {connection_succeeded:false,
                                         inbox_exists:false}
    let hostIndex = 0

    while(hostIndex < sortedMxRecords.length){
        try{
            smtpResult = await testMailOnServer(sortedMxRecords[hostIndex].exchange,req.body.email) as TTestInboxResults;

            if(!(smtpResult.connection_succeeded)){
                hostIndex++
            } 
            else {
                break
            }
        } catch(error){
            console.error(error)
        }
    }

    let useCatchAll = false


    try {
        const catchAllEmail = `${randomBytes(20).toString('hex')}@${domain}`;
        const catchAllResult = await testMailOnServer(sortedMxRecords[hostIndex].exchange, catchAllEmail) as TTestInboxResults;
        useCatchAll = catchAllResult.inbox_exists;
      } catch (error) {
        console.error(error);
      }
     

    res.json({
        email_format_is_valid:emailFormatIsValid,
        use_catch_all:useCatchAll,
        ...smtpResult
    })
    next()
}