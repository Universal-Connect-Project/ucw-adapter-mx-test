/* eslint-disable @typescript-eslint/naming-convention */
import type { Response } from 'express'
import Joi from 'joi'
import { getProviderAdapter } from '../adapters'
import getVC from '../services/vcProviders'
import { Providers } from '../shared/contract'
import { createProviderValidator } from '../utils/validators'

export interface AccountsDataQueryParameters {
  connectionId: string
  provider: string
  userId: string
}

export interface AccountsRequest {
  params: AccountsDataQueryParameters
}

export interface IdentityRequest {
  params: IdentityDataParameters
}

export interface TransactionsRequest {
  query: TransactionsDataQueryParameters
}

export const accountsDataHandler = async (
  req: AccountsRequest,
  res: Response
) => {
  const { provider, connectionId, userId } = req.params

  const providerAdapter = getProviderAdapter(provider)
  const providerUserId = await providerAdapter.ResolveUserId(userId)

  try {
    const vc = await getVC(provider, connectionId, 'accounts', providerUserId)
    res.send({
      jwt: vc
    })
  } catch (error) {
    res.status(400)
    res.send('Something went wrong')
  }
}

export interface IdentityDataParameters {
  connectionId: string
  provider: string
  userId: string
}

export const identityDataHandler = async (
  req: IdentityRequest,
  res: Response
) => {
  const { provider, connectionId, userId } =
    req.params as unknown as IdentityDataParameters

  const providerAdapter = getProviderAdapter(provider)
  const providerUserId = await providerAdapter.ResolveUserId(userId)

  try {
    const vc = await getVC(provider, connectionId, 'identity', providerUserId)
    res.send({
      jwt: vc
    })
  } catch (error) {
    res.status(400)
    res.send('Something went wrong')
  }
}

export interface TransactionsDataQueryParameters {
  account_id: string
  end_time: string
  provider: string
  start_time: string
  user_id: string
}

export const transactionsDataHandler = async (
  req: TransactionsRequest,
  res: Response
) => {
  const schema = Joi.object({
    account_id: Joi.string().required(),
    end_time: Joi.when('provider', {
      is: Providers.SOPHTRON,
      then: Joi.string().required()
    }),
    provider: createProviderValidator(),
    start_time: Joi.when('provider', {
      is: Providers.SOPHTRON,
      then: Joi.string().required()
    }),
    user_id: Joi.string().required()
  })

  const { error } = schema.validate(req.query)

  if (error) {
    res.status(400)
    res.send(error.details[0].message)

    return
  }

  const { provider, user_id, account_id, start_time, end_time } =
    req.query as unknown as TransactionsDataQueryParameters

  const providerAdapter = getProviderAdapter(provider)
  const providerUserId = await providerAdapter.ResolveUserId(user_id)

  try {
    const vc = await getVC(
      provider,
      undefined,
      'transactions',
      providerUserId,
      account_id,
      start_time,
      end_time
    )
    res.send({
      jwt: vc
    })
  } catch (error) {
    res.status(400)
    res.send('Something went wrong')
  }
}
