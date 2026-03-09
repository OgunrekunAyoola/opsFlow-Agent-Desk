import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export const validate =
  (schema: ZodType) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 might use .issues instead of .errors, or behave differently.
        // We'll try to access errors safely.
        const issues = (error as any).errors || (error as any).issues || [];
        return res.status(400).json({
          error: 'validation_error',
          details: issues.map((e: any) => ({
            path: e.path ? e.path.join('.') : 'unknown',
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
