'use client'

import { getCrudDappProgram, getCrudDappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

interface CreateEntryArgs {
  title: string
  message: string
  owner: PublicKey
}

interface UpdateEntryArgs {
  title: string
  message: string
}

interface DeleteEntryArgs {
  title: string
}

export function useCrudDappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudDappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCrudDappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['crud-dapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['journalEntry', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to create entry')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  }
}

export function useCrudDappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program } = useCrudDappProgram()

  const accountQuery = useQuery({
    queryKey: ['crud-dapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['journalEntry', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accountQuery.refetch()
    },
    onError: () => {
      toast.error('Failed to create entry')
    },
  })

  const updateEntry = useMutation<string, Error, UpdateEntryArgs>({
    mutationKey: ['journalEntry', 'update', { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.updateJournal(title, message).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accountQuery.refetch()
    },
    onError: () => {
      toast.error('Failed to update entry')
    },
  })

  const deleteEntry = useMutation<string, Error, DeleteEntryArgs>({
    mutationKey: ['journalEntry', 'delete', { cluster }],
    mutationFn: async ({ title }) => {
      return program.methods.deleteJournal(title).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accountQuery.refetch()
    },
    onError: () => {
      toast.error('Failed to delete entry')
    },
  })

  return {
    accountQuery,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}