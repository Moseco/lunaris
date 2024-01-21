import { Request, Response } from 'express';

export function welcome(req: Request, res: Response) {
    return res.send('Welcome to the api!');
}