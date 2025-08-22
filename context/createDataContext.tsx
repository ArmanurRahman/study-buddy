import React, { useReducer } from 'react';

type ActionFunction = (dispatch: React.Dispatch<any>) => (...args: any[]) => any;
type ActionsMap = {
  [key: string]: ActionFunction;
};

export default (reducer: React.Reducer<any, any>, actions: ActionsMap, defaultValue: any) => {
  const Context = React.createContext({ state: defaultValue });

  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, defaultValue);

    const boundActions: { [key: string]: (...args: any[]) => any } = {};
    for (let key in actions) {
      boundActions[key] = actions[key](dispatch);
    }

    return <Context.Provider value={{ state, ...boundActions }}>{children}</Context.Provider>;
  };

  return { Context, Provider };
};
