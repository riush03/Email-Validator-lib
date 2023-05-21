import { MxRecord,promises } from "node:dns"

export const resolveMxRecords = async (domain:string): Promise<MxRecord[]> => {
    try{
        return await promises.resolveMx(domain)
    } catch(error){
        console.error(error)
        return []
    }
}