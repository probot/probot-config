declare module 'probot-config' {
  import { Context } from 'probot';
  import { Options as DeepMergeOptions } from 'deepmerge';

  export default function getConfig<T>(
    context: Context,
    fileName: string,
    defaultConfig?: T,
    deepMergeOptions?: DeepMergeOptions
  ): Promise<T>;
}
