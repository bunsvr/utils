import { dir } from "../..";
import { Router as Stric } from '@stricjs/router';

export default new Stric()
    .get('/*', dir(import.meta.dir + '/public'));
