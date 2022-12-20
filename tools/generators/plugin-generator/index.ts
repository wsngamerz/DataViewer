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
    // get root of lib
    const libraryRoot = readProjectConfiguration(tree, schema.name).root;

    // build ontop of the library generator
    await libraryGenerator(tree, { name: schema.name });

    // remove what we dont need
    tree.delete(joinPathFragments(libraryRoot, 'src/lib'));

    // add own files
    generateFiles(
        tree,
        joinPathFragments(__dirname, './files'),
        libraryRoot,
        schema
    );

    // format files
    await formatFiles(tree);

    // install packages
    return () => {
        installPackagesTask(tree);
    };
}
