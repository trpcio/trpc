/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertNotBrowser } from './assertNotBrowser';
import { InputValidationError } from './errors';
import { MiddlewareFunction } from './router';
assertNotBrowser();

export type ProcedureInputParserZodEsque<TInput = unknown> = {
  parse: (input: any) => TInput;
};

export type ProcedureInputParserCustomValidatorEsque<TInput = unknown> = (
  input: unknown,
) => TInput;

export type ProcedureInputParserYupEsque<TInput = unknown> = {
  validateSync: (input: unknown) => TInput;
};
export type ProcedureInputParser<TInput = unknown> =
  | ProcedureInputParserZodEsque<TInput>
  | ProcedureInputParserYupEsque<TInput>
  | ProcedureInputParserCustomValidatorEsque<TInput>;

export type ProcedureResolver<
  TContext = unknown,
  TInput = unknown,
  TOutput = unknown
> = (opts: { ctx: TContext; input: TInput }) => Promise<TOutput> | TOutput;

interface ProcedureOptions<TContext, TInput, TOutput> {
  middlewares: MiddlewareFunction<TContext>[];
  resolver: ProcedureResolver<TContext, TInput, TOutput>;
  inputParser: ProcedureInputParser<TInput>;
}

interface ProcedureCallOptions<TContext> {
  ctx: TContext;
  input: unknown;
}
export abstract class Procedure<
  TContext = unknown,
  TInput = unknown,
  TOutput = unknown
> {
  public readonly middlewares: Readonly<MiddlewareFunction<TContext>[]>;
  protected resolver: ProcedureResolver<TContext, TInput, TOutput>;
  private inputParser: ProcedureInputParser<TInput>;

  constructor(opts: ProcedureOptions<TContext, TInput, TOutput>) {
    this.middlewares = opts.middlewares;
    this.resolver = opts.resolver;
    this.inputParser = opts.inputParser;
  }

  public parseInput(rawInput: unknown): TInput {
    try {
      const parser: any = this.inputParser;

      if (typeof parser === 'function') {
        return parser(rawInput);
      }
      if (typeof parser.parse === 'function') {
        return parser.parse(rawInput);
      }

      if (typeof parser.validateSync === 'function') {
        return parser.validateSync(rawInput);
      }

      throw new Error('Could not find a validator fn');
    } catch (_err) {
      const err = new InputValidationError(_err);
      throw err;
    }
  }

  async call({
    ctx,
    input: rawInput,
  }: ProcedureCallOptions<TContext>): Promise<TOutput> {
    const input = this.parseInput(rawInput);
    const output = await this.resolver({ ctx, input });
    return output;
  }

  public inheritMiddlewares(middlewares: MiddlewareFunction<TContext>[]): this {
    const Constructor: {
      new (opts: ProcedureOptions<TContext, TInput, TOutput>): Procedure<
        TContext,
        TInput,
        TOutput
      >;
    } = (this as any).constructor;

    const instance = new Constructor({
      middlewares: [...middlewares, ...this.middlewares],
      resolver: this.resolver,
      inputParser: this.inputParser,
    });

    return instance as any;
  }
}

export class ProcedureWithoutInput<TContext, TOutput> extends Procedure<
  TContext,
  undefined,
  TOutput
> {}

export class ProcedureWithInput<TContext, TInput, TOutput> extends Procedure<
  TContext,
  TInput,
  TOutput
> {}

export type CreateProcedureWithInput<TContext, TInput, TOutput> = {
  input: ProcedureInputParser<TInput>;
  resolve: ProcedureResolver<TContext, TInput, TOutput>;
};
export type CreateProcedureWithoutInput<TContext, TOutput> = {
  input?: null | undefined;
  resolve: ProcedureResolver<TContext, undefined, TOutput>;
};

export type CreateProcedureOptions<TContext, TInput, TOutput> =
  | CreateProcedureWithInput<TContext, TInput, TOutput>
  | CreateProcedureWithoutInput<TContext, TOutput>;

export function createProcedure<TContext, TInput, TOutput>(
  opts: CreateProcedureWithInput<TContext, TInput, TOutput>,
): ProcedureWithInput<TContext, TInput, TOutput>;
export function createProcedure<TContext, TOutput>(
  opts: CreateProcedureWithoutInput<TContext, TOutput>,
): ProcedureWithoutInput<TContext, TOutput>;
export function createProcedure<TContext, TInput, TOutput>(
  opts: CreateProcedureOptions<TContext, TInput, TOutput>,
): Procedure<TContext, TInput, TOutput>;
export function createProcedure<TContext, TInput, TOutput>(
  opts: CreateProcedureOptions<TContext, TInput, TOutput>,
) {
  if (opts.input) {
    return new ProcedureWithInput({
      inputParser: opts.input,
      resolver: opts.resolve,
      middlewares: [],
    });
  }
  return new ProcedureWithoutInput({
    resolver: opts.resolve,
    middlewares: [],
    inputParser: () => undefined,
  });
}

export type inferProcedureFromOptions<
  TOptions extends CreateProcedureOptions<any, any, any>
> = TOptions extends CreateProcedureWithInput<
  infer TContext,
  infer TInput,
  infer TOutput
>
  ? ProcedureWithInput<TContext, TInput, TOutput>
  : TOptions extends CreateProcedureWithoutInput<
      //
      infer TContext,
      infer TOutput
    >
  ? ProcedureWithoutInput<TContext, TOutput>
  : Procedure<unknown, unknown>;

// type Proc = inferProcedureFromOptions<{
//   resolve(): { text: 'hey' };
// }>;

// type Proc2 = inferProcedureFromOptions<{
//   input(): { id: number };
//   resolve(): { text: 'hey' };
// }>;
