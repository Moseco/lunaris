import { Pool, PoolClient, QueryResult } from 'pg';
import { db } from '../config/config';

// Set up the pool to get clients from
const pool = new Pool(db);

pool.on('error', function (err: Error, _client: any) {
    console.log(`Pool Error:\n${err.message}\n${err.stack}`);
});

// Run a query with given parameters. The function handles the lifecycle of the client
// This function throws errors related to SQL
export const query = async (sqlText: string, params: any[] = []): Promise<QueryResult<any>> => {
    const client = await pool.connect();
    try {
        const result = await client.query(sqlText, params);
        return result
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

// Creates a client to be managed by the caller of the function
export const getClient = async (): Promise<PoolClient> => {
    const client = await pool.connect()
    return client
};