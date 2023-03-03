import * as React from "react";
import {useLingui} from "@lingui/react";
import {RouterI18n} from "./RouterI18n";

export type I18nPath = string;

const Context = React.createContext<RouterI18n | null>(null);

interface LinguiRouterProps {
  catalogs: { [locale: string]: object },
  children: React.ReactNode
}

const { i18n } = useLingui()

export const LinguiRouter = ({catalogs, children}: LinguiRouterProps) => (
    <Context.Provider value={new RouterI18n(i18n.locale, catalogs)}>{children}</Context.Provider>
);

export const WithLinguiRouter = ({children}: { children: (routerI18n: RouterI18n) => React.ReactNode }) => (
  <Context.Consumer>{(routerI18n) => {
    if (!routerI18n) {
      throw new ReferenceError("You forgot to wrap your app in <LinguiRouter />");
    }
    return children(routerI18n);
  }}</Context.Consumer>
);


