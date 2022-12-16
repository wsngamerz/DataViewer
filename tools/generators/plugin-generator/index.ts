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
    // use base library generator
    await libraryGenerator(tree, { name: schema.name });

    // add own files
    const libraryRoot = readProjectConfiguration(tree, schema.name).root;
    generateFiles(
        tree,
        joinPathFragments(__dirname, './files'),
        libraryRoot,
        schema
    );

    await formatFiles(tree);
    return () => {
        installPackagesTask(tree);
    };
}
