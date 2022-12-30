import {
    Tree,
    formatFiles,
    installPackagesTask,
    generateFiles,
    joinPathFragments,
    readProjectConfiguration,
    updateProjectConfiguration,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';

interface IPluginGeneratorSchema {
    name: string;
    displayName: string;
    mainClass: string;
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
        directory: `libs/plugins`,
    });

    // get root of lib
    const projectName = `plugins-${schema.name}`;
    const projectConfig = readProjectConfiguration(tree, projectName);
    const libraryRoot = projectConfig.root;

    // remove what we dont need
    tree.delete(joinPathFragments(libraryRoot, 'src/lib'));
    tree.delete(joinPathFragments(libraryRoot, 'tsconfig.lib.json'));

    // add own files
    generateFiles(tree, joinPathFragments(__dirname, './files'), libraryRoot, {
        ...schema,
        tmpl: '',
        pluginName: schema.name,
        pluginDisplayName: schema.displayName,
        mainClass: schema.mainClass,
    });

    // add our custom build targets
    updateProjectConfiguration(tree, projectName, {
        ...projectConfig,
        targets: {
            ...projectConfig.targets,
            build: {
                executor: 'nx:run-commands',
                options: {
                    commands: [
                        'nx run plugin-test:build-plugin',
                        'nx run plugin-test:build-ui',
                    ],
                    parallel: false,
                },
            },
            'build-plugin': {
                executor: '@nrwl/js:tsc',
                outputs: ['{options.outputPath}'],
                options: {
                    outputPath: joinPathFragments('dist/libs', schema.name),
                    main: joinPathFragments(libraryRoot, 'src/index.ts'),
                    tsConfig: joinPathFragments(
                        libraryRoot,
                        'tsconfig.plugin.json'
                    ),
                    assets: [joinPathFragments(libraryRoot, '*.md')],
                },
            },
            'build-ui': {
                executor: '@nrwl/rollup:rollup',
                outputs: ['{options.outputPath}'],
                options: {
                    outputPath: joinPathFragments(
                        'dist/libs',
                        schema.name,
                        'src/ui'
                    ),
                    tsConfig: joinPathFragments(
                        libraryRoot,
                        'tsconfig.ui.json'
                    ),
                    project: joinPathFragments(libraryRoot, 'package.json'),
                    entryFile: joinPathFragments(
                        libraryRoot,
                        'src/ui/index.ts'
                    ),
                    external: ['react/jsx-runtime'],
                    rollupConfig: '@nrwl/react/plugins/bundle-rollup',
                    compiler: 'swc',
                    assets: [],
                },
            },
        },
    });

    // format files
    await formatFiles(tree);

    // install packages
    return () => {
        installPackagesTask(tree);
    };
}
