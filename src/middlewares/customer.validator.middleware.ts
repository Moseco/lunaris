import { Request, Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import Customer from '../models/customer';

export const customerValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation
        if (!req.body) return res.status(400).send({ message: 'Missing request body' });

        // Get values
        const customer = new Customer(req.body.customer);

        // Validate
        await validateOrReject(customer);

        // Save the customer object in res.locals to be accessed later
        res.locals.customer = customer;

        next();
    } catch (e: any) {
        // Send error
        if (e.length > 0 && 'constraints' in e[0]) {
            const message = Object.values(e[0].constraints)[0];
            res.status(400).send({ message });
        } else {
            res.status(400).send({ message: 'Invalid request body' });
        }
    }
};