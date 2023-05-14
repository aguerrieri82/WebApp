import { configureRollup } from 'build-utils';

export default configureRollup({
    keepFunctions: /app/
});