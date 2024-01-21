import { Request, Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import PointsChange from '../models/points_change';

export const pointsChangeValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation
        if (!req.body) return res.status(400).send({ message: 'Missing request body' });

        // Get values
        const pointsChange = new PointsChange(req.body);

        // Validate
        await validateOrReject(pointsChange);

        // Save the pointsChange object in res.locals to be accessed later
        res.locals.pointsChange = pointsChange;

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