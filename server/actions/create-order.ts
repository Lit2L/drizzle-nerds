'use server'

// import { createOrderSchema } from '@/types/order-schema'
import * as z from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { auth } from '../auth'
import { db } from '@/server'
import { orderProduct, orders } from '../schema'
import { createOrderSchema } from '@/types/order-schema'

const action = createSafeActionClient()

type Product = {
	productID: number
	quantity: number
	variantID: string
}

// Update the createOrderSchema to use the Product Type

export const createOrder = action(
	createOrderSchema,
	async ({
		products,
		status,
		total,
		paymentIntentID
	}: {
		products: Product[]
		status: string
		total: number
		paymentIntentID: string
	}) => {
		const user = await auth()
		if (!user) return { error: 'user not found' }

		try {
			// insert order
			const order = await db
				.insert(orders)
				.values({
					status,
					paymentIntentID,
					total,
					userID: user.user.id
				})
				.returning()

			// Insert order products
			const orderProducts = await Promise.all(
				products.map(({ productID, quantity, variantID }) =>
					db.insert(orderProduct).values({
						quantity: quantity,
						orderID: order[0].id,
						productID: productID,
						productVariantID: variantID
					})
				)
			)
			return {
				success: 'Order has been added',
				order: order[0],
				orderProducts
			}
		} catch (error) {
			console.error('Order creation failed:', error)
			return { error: 'Failed to create order' }
		}
	}
)
