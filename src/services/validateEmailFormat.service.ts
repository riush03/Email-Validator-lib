export const validateEmailFormat = (email:string) => {
    //Account for more domain endings eg .co.uk .co.ke
    //https://www.abstractapi.com/guides/email-validation-regex-javascript
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)?$/, "gm");
    return emailRegex.test(email)
}