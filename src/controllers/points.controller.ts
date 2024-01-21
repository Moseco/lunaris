import { Request, Response } from 'express';
import { query, getClient } from '../db';
import Customer from '../models/customer';
import PointsChange from '../models/points_change';
import PointsModifier from '../models/points_modifier';

export async function getPoints(req: Request, res: Response) {
    // Validate that request came from valid source. 
    // Not implemented for this example, possible methods:
    //      - Check Authorization header (secret, token, etc)

    // Get customer object
    const customer: Customer = res.locals.customer;

    // Try to find customer
    try {
        const result = await query(
            'SELECT * FROM customers WHERE email = $1 OR phone = $2',
            [customer.email, customer.phone]
        );

        if (result.rowCount == 1) {
            // Success, return points
            return res.send({ points: result.rows[0].points });
        } else if (result.rowCount == 0) {
            // Customer not found, return 404 and error message
            return res.status(404).send({ message: 'Customer not found' });
        } else {
            // Two customers exist in the database each using the provided email and phone number respectively
            // Some policy would need to be created for how to handle this.
            // For this example status code 400 is returned with an error message
            return res.status(400).send({ message: 'Multiple customers found' });
        }
    } catch (e) {
        return res.status(500).send({ message: 'Something went wrong' });
    }
}

export async function changePoints(req: Request, res: Response) {
    // Validate that request came from valid source. 
    // Not implemented for this example, possible methods:
    //      - Check Authorization header (secret, token, etc)

    // Get points change object
    const pointsChange: PointsChange = res.locals.pointsChange;

    // Get client
    const client = await getClient();

    try {
        // Get customer matching the email and/or phone number
        const customerQueryResult = await client.query(
            'SELECT * FROM customers WHERE email = $1 OR phone = $2',
            [pointsChange.customer.email, pointsChange.customer.phone]
        );

        // Customer ID and points to edit later
        let customerId = null;
        let customerPoints = 0;

        if (customerQueryResult.rowCount == 0) {
            // Customer not found, return 404 and error message
            return res.status(404).send({ message: 'Customer not found' });
        } else if (customerQueryResult.rowCount == 1) {
            // Customer found, get id and current points
            customerId = customerQueryResult.rows[0].id;
            customerPoints = customerQueryResult.rows[0].points;
        } else if (customerQueryResult.rowCount == 2) {
            // Two customers exist in the database each using the provided email and phone number respectively
            // Solution would be based on policy
            // For this example the points will be granted to the customer with the matching email (email is less transient)
            if (customerQueryResult.rows[0].email == pointsChange.customer.email) {
                customerId = customerQueryResult.rows[0].id;
                customerPoints = customerQueryResult.rows[0].points;
            } else {
                customerId = customerQueryResult.rows[1].id;
                customerPoints = customerQueryResult.rows[1].points;
            }
        }

        // Start transaction
        await client.query('BEGIN')

        // Try to insert into points_history
        await client.query(
            'INSERT INTO points_history ( customer_id, change, created_at ) VALUES ($1, $2, current_timestamp)',
            [customerId, pointsChange.amount]
        );

        // Modify points total for customer
        await client.query(
            'UPDATE customers SET points = $1 WHERE id = $2',
            [customerPoints + pointsChange.amount, customerId]
        );

        // Commit transaction
        await client.query('COMMIT')
    } catch (e) {
        // Something went wrong, rollback and return an error message
        await client.query('ROLLBACK')
        return res.status(500).send({ message: 'Something went wrong' });
    } finally {
        client.release();
    }

    return res.send({ message: 'Success' });
}

export async function setModifier(req: Request, res: Response) {
    // Validate that request came from valid source. 
    // Not implemented for this example, possible methods:
    //      - Check Authorization header (secret, token, etc)

    // Get pointsModifier object
    const pointsModifier: PointsModifier = res.locals.pointsModifier;

    // Add the modifier
    try {
        const result = await query(
            'INSERT INTO points_modifiers ( modifier, created_at, valid_until ) VALUES ($1, current_timestamp, $2)',
            [pointsModifier.modifier, pointsModifier.validUntil]
        );
    } catch (e) {
        return res.status(500).send({ message: 'Something went wrong' });
    }

    return res.send({ message: 'Success' });
}