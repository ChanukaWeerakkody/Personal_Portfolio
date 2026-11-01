import { register } from 'node:module';
import { URL } from 'node:url';

register(new URL('./resolve-hook.mjs', import.meta.url));
