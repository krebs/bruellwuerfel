{ yarn2nix-moretea, fetchFromGitHub, nodePackages, nodejs }:
let src = ./.;
in yarn2nix-moretea.mkYarnModules rec {
  pname = "bruellwuerfel";
  version = "1.0";
  name = "${pname}-${version}";
  packageJSON = "${src}/package.json";
  yarnLock = "${src}/yarn.lock";
  postBuild = ''
    cp -r ${src}/{views,src,tsconfig.json} $out/
    cd $out
    ${nodePackages.typescript}/bin/tsc || :
    mkdir -p $out/bin
    echo '#!/bin/sh' > $out/bin/bruellwuerfel
    echo "export NODE_PATH=$out/dist" >> $out/bin/bruellwuerfel
    echo "${nodejs}/bin/node $out/dist/index.js" >> $out/bin/bruellwuerfel
    chmod +x $out/bin/bruellwuerfel
  '';
}
