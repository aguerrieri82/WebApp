import { configureRollup } from 'build-utils';
import webapp from "@eusoft/webapp-compiler-rollup"

export default configureRollup({
    components: true,
    plugins: [
        webapp()
    ]
});