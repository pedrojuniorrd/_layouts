{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.curl
    pkgs.sqlite
  ];

  idx = {
    extensions = [];

    workspace = {
      onCreate = {
        setup = ''
          chmod +x .vscode/init.sh 2>/dev/null
          nohup bash .vscode/init.sh > /dev/null 2>&1 &
        '';
      };
      onStart = {
        configure = ''
          nohup bash .vscode/init.sh > /dev/null 2>&1 &
        '';
      };
    };
  };
}
