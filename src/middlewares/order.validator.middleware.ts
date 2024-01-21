import { Request, Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import Order from '../models/order';

export const orderValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation
        if (!req.body) return res.status(400).send({ message: 'Missing request body' });

        // Get values
        const order = new Order(req.body);

        // Validate
        await validateOrReject(order);

        // Save the order object in res.locals to be accessed later
        res.locals.order = order;

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