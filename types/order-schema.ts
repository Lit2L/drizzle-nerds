import * as z from 'zod'

export const createOrderSchema = z.object({
	status: z.string(),
	total: z.number(),
	paymentIntentID: z.string(),
	products: z.array(
		z.object({
			quantity: z.number(),
			productID: z.number(),
			variantID: z.number()
		})
	)
})
