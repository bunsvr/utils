import { writer } from '..';
import { Router } from '@stricjs/router';

export default new Router()
    .get('/', writer(
        (req, res) => {
            // Use this when streaming is necessary
            res.write(req.url);
            res.end();
        }
    ));
