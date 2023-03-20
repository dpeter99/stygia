const { composePlugins, withNx, withWeb } = require('@nrwl/webpack');
const { merge, mergeWithRules } = require('webpack-merge');

const debug = false;

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  //return config;

  if(debug) {
    console.log("Debug")
    console.log(config.module.rules);
    console.log("############## End Debug ############")
  }

  config = mergeWithRules(
    {
      module: {
        rules: {
          test: "match",
          oneOf: "replace",
          use: "replace",
        },
      },
    }
  )(config, {
    module: {
      rules: [
        { test: /\.css$|\.scss$|\.sass$|\.less$|\.styl$/, use: [
          { loader: "style-loader" },  // to inject the result into the DOM as a style block
          { loader: "css-modules-typescript-loader"},  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
          { loader: "css-loader", options: { modules: { localIdentName: "[path][name]__[local]"} } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
          { loader: "sass-loader", options: {
            sassOptions: { includePaths: [ 'libs/client/ui/matui-lib/src/lib/styles/' ] } }
          },  // to convert SASS to CSS
          // NOTE: The first build after adding/removing/renaming CSS classes fails, since the newly generated .d.ts typescript module is picked up only later
      ] },
      ],
    },
  });

  if(debug) {
    console.log("Debug")
    console.log(config.module.rules);
    console.log("############## End Debug ############")
  }

  return config;
});
