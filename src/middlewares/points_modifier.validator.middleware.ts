import { Request, Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import PointsModifier from '../models/points_modifier';

export const pointsModifierValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation
        if (!req.body) return res.status(400).send({ message: 'Missing request body' });

        // Get values
        const pointsModifier = new PointsModifier(req.body);

        // Validate
        await validateOrReject(pointsModifier);

        // Save the pointsModifier object in res.locals to be accessed later
        res.locals.pointsModifier = pointsModifier;

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