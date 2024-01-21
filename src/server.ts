import app from './app';
import * as config from './config/config';

const port = config.server.port;

app.listen(port, () => {
    console.log(`[server]: Server is running a http://localhost:${port}`);
})