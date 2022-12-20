import {
    Tree,
    formatFiles,
    installPackagesTask,
    generateFiles,
    joinPathFragments,
    readProjectConfiguration,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';

interface IPluginGeneratorSchema {
    name: string;
}

export default async function (tree: Tree, schema: IPluginGeneratorSchema) {
    // ensure that the plugin starts with 'plugin-'
    if (!schema.name.startsWith('plugin-')) {
        schema.name = `plugin-${schema.name}`;
    }

    // build ontop of the library generator
    await libraryGenerator(tree, {
        name: schema.name,
        buildable: true,
        babelJest: false,
    });

    // get root of lib
    const libraryRoot = readProjectConfiguration(tree, schema.name).root;

    // remove what we dont need
    tree.delete(joinPathFragments(libraryRoot, 'src/lib'));

    // add own files
    generateFiles(tree, joinPathFragments(__dirname, './files'), libraryRoot, {
        ...schema,
        tmpl: '',
    });

    // format files
    await formatFiles(tree);

    // install packages
    return () => {
        installPackagesTask(tree);
    };
}
