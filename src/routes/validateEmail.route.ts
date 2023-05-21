import { Router } from "express";
import { validateEmail } from "../controllers/validateEmail.controller";
import exp from "constants";

const validateEmailRoutes =  Router()
validateEmailRoutes.post('/',validateEmail)

export {validateEmailRoutes}