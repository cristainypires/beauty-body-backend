import {ZodError} from 'zod';
import { patch } from '../routes/agendamento.routes';

export function validate (schema, property = 'body') {
    return async (req, res, next)=>{
        try{
            const data = req[property];
            const parsed = await schema.parseAsync(data);
            req.validated = req.validated || {};
            req.validated[property] = parsed;
            next();

        } catch (error){
            if (error instanceof ZodError){
                const errors = error.errors.map((err) => ({
                    patchh: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({errors});
            }
            next(error);
        }
    };
}