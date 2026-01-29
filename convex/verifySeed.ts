
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const countBudgetItems = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("budgetItems").count();
    }
});

export const verifyData = internalAction({
    args: {},
    handler: async (ctx) => {
        const count = await ctx.runQuery(internal.verifySeed.countBudgetItems);
        console.log(`Budget Items Count: ${count}`);
    }
});
