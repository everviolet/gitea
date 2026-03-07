{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShellNoCC { packages = with pkgs; [ deno typescript-language-server ]; }
