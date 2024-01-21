import { Request, Response } from 'express';
import { getClient } from '../db';
import Order from '../models/order';

export async function newOrder(req: Request, res: Response) {
    // Validate that request came from valid source. 
    // Not implemented for this example, possible methods:
    //      - Check Authorization header (secret, token, etc)
    //      - Look up the order ID from source as new get request

    // Get order object and amount paid
    const order: Order = res.locals.order;
    // If non Japanese yen currency can be used do needed conversion here
    const amountPaidInYen = order.amountPaid;

    // Get client
    const client = await getClient();

    try {
        // Get customer matching the email and/or phone number
        const customerQueryResult = await client.query(
            'SELECT * FROM customers WHERE email = $1 OR phone = $2',
            [order.customer.email, order.customer.phone]
        );

        // Customer ID to edit later
        let customerId = null;
        let customerPoints = null;

        if (customerQueryResult.rowCount == 1) {
            customerId = customerQueryResult.rows[0].id;
            customerPoints = customerQueryResult.rows[0].points;
        } else if (customerQueryResult.rowCount == 2) {
            // Two customers exist in the database each using the provided email and phone number respectively
            // Solution would be based on policy
            // For this example the points will be granted to the customer with the matching email
            if (customerQueryResult.rows[0].email == order.customer.email) {
                customerId = customerQueryResult.rows[0].id;
                customerPoints = customerQueryResult.rows[0].points;
            } else {
                customerId = customerQueryResult.rows[1].id;
                customerPoints = customerQueryResult.rows[1].points;
            }
        }

        // Get any possible multipliers to use with points
        let pointsModifier = 0.01;
        const modifierResult = await client.query('SELECT * FROM points_modifiers WHERE valid_until IS NULL OR valid_until >= current_timestamp ORDER BY created_at DESC LIMIT 1')
        if (modifierResult.rowCount == 1) {
            pointsModifier = modifierResult.rows[0].modifier;
        }
        const pointsToGrant = amountPaidInYen * pointsModifier;

        // Start transaction
        await client.query('BEGIN')

        if (customerId != null) {
            // Modify points total for customer
            await client.query(
                'UPDATE customers SET points = $1 WHERE id = $2',
                [customerPoints + pointsToGrant, customerId]
            );
        } else {
            // No customers were returned previously, policy would determine what to do
            // For this example a new customer with points equal to the order amount * modifier will be created
            const newCustomerResult = await client.query(
                'INSERT INTO customers ( email, phone, points) VALUES ($1, $2, $3) RETURNING id',
                [order.customer.email, order.customer.phone, pointsToGrant]
            );
            customerId = newCustomerResult.rows[0].id;
        }

        // Try to insert order into the points_history
        await client.query(
            'INSERT INTO points_history ( customer_id, change, created_at, order_id ) VALUES ($1, $2, current_timestamp, $3)',
            [customerId, pointsToGrant, order.id]
        );

        // Commit transaction
        await client.query('COMMIT')
    } catch (e) {
        // If something goes wrong rollback and save the order for later processing
        // Saving it for later is not implemented for this example
        //      Example method could be saving the raw request body for later processing
        await client.query('ROLLBACK');
        return res.status(500).send({ message: 'Something went wrong' });
    } finally {
        client.release();
    }

    return res.send({ message: 'Success' });
}