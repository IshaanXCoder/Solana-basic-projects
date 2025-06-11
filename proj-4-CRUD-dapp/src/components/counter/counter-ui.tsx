'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudDappProgram, useCrudDappProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PenTool, BookOpen, Edit3, Trash2, User, Plus, Share2, Shield, Database } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudCreate() {
  const { createEntry } = useCrudDappProgram()
  const { publicKey } = useWallet()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !title.trim() || !message.trim()) return
    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        owner: publicKey,
      })
      setTitle('')
      setMessage('')
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  return (
    <section className="container max-w-screen-2xl py-16 bg-zinc-50 dark:bg-zinc-950">
      <Card className="max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            New Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-900 dark:text-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={32}
              required
            />
            <div className="text-right text-xs text-muted-foreground">
              {title.length}/32 characters
            </div>
            <Textarea
              placeholder="Share your thoughts..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              maxLength={280}
              required
            />
            <div className="text-right text-xs text-muted-foreground">
              {message.length}/280 characters
            </div>
            <Button 
              type="submit"
              className="w-full"
              disabled={createEntry.isPending || !publicKey || !title.trim() || !message.trim()}
            >
              {createEntry.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </div>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Publish to Blockchain
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

export function CrudList() {
  const { accounts, getProgramAccount } = useCrudDappProgram()

  if (getProgramAccount.isLoading) {
    return (
      <section className="container max-w-screen-2xl py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    )
  }

  if (!getProgramAccount.data?.value) {
    return (
      <section className="container max-w-screen-2xl py-16 bg-zinc-50 dark:bg-zinc-950">
        <Card className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="text-center py-12">
            <div className="text-yellow-600 dark:text-yellow-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Program Not Found</h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Make sure you have deployed the program and are on the correct cluster.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="container max-w-screen-2xl py-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Journal Entries</h2>
        <p className="text-muted-foreground">Discover stories and experiences from the community</p>
      </div>

      {accounts.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-zinc-50 dark:bg-zinc-900">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.data?.map((account) => (
            <CrudCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-900">
          <CardContent className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
            <h3 className="text-2xl font-semibold text-muted-foreground mb-4">No Journal Entries Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your story! Create a journal entry above to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default function CrudDappPage() {
  const { getProgramAccount } = useCrudDappProgram()

  return (
    <div className="w-full">
      <div className="relative">
        {/* Hero Section */}
        <section className="container max-w-screen-2xl py-24 text-center bg-zinc-50 dark:bg-zinc-950">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100">
              Journal DApp
            </h1>
            <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground dark:text-zinc-300 sm:text-xl sm:leading-8">
              Share your thoughts, experiences, and stories on the blockchain. Create immutable journal entries that are
              stored on-chain and can be updated or deleted by their owners. Your digital diary, secured by Solana.
            </p>

            {/* Program Address */}
            {getProgramAccount.data?.value && (
              <div className="mx-auto max-w-md rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Program Address:</p>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {ellipsify(getProgramAccount.data.value.toString())}
                </code>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="container max-w-screen-2xl py-16 bg-zinc-50 dark:bg-zinc-950">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Create</h3>
              <p className="text-sm text-muted-foreground">Write entries</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Edit3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Edit</h3>
              <p className="text-sm text-muted-foreground">Update anytime</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Share</h3>
              <p className="text-sm text-muted-foreground">Public stories</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Secure</h3>
              <p className="text-sm text-muted-foreground">On-chain data</p>
            </div>
          </div>
        </section>

        <CrudCreate />
        <CrudList />
      </div>
    </div>
  )
}

function CrudCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudDappProgramAccount({ account })
  const { publicKey } = useWallet()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')

  const journalData = useMemo(() => accountQuery.data, [accountQuery.data])
  const isOwner = useMemo(
    () => publicKey && journalData?.owner ? publicKey.equals(journalData.owner) : false,
    [publicKey, journalData?.owner]
  )

  const handleEdit = () => {
    if (journalData) {
      setEditTitle(journalData.title)
      setEditMessage(journalData.message)
      setIsEditing(true)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim() || !editMessage.trim()) return
    try {
      await updateEntry.mutateAsync({
        title: editTitle.trim(),
        message: editMessage.trim(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleDelete = async () => {
    if (!journalData?.title) return
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await deleteEntry.mutateAsync({ title: journalData.title })
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }

  if (accountQuery.isLoading) {
    return (
      <Card className="animate-pulse bg-zinc-50 dark:bg-zinc-900">
        <CardHeader className="space-y-2">
          <div className="h-6 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!journalData) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="text-destructive">
          <p className="text-destructive">Failed to load journal entry</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (timestamp: any) => {
    try {
      // Handle different timestamp formats that might come from Solana
      const date = new Date(timestamp * 1000) // Assuming Unix timestamp
      return date.toISOString().split('T')[0]
    } catch {
      return new Date().toISOString().split('T')[0]
    }
  }

  return (
    <Card className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-bold"
                maxLength={32}
                required
              />
            ) : (
              <CardTitle className="text-lg">{journalData.title}</CardTitle>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(Date.now() / 1000)}</span>
              <span>•</span>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
                className="hover:text-primary transition-colors duration-200 text-xs font-mono"
              />
            </div>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="ml-2">
              <User className="h-3 w-3 mr-1" />
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-zinc-900 dark:text-zinc-100">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <Textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={280}
              required
            />
            <div className="text-right text-xs text-muted-foreground">
              {editMessage.length}/280 characters
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={updateEntry.isPending || !editTitle.trim() || !editMessage.trim()}
              >
                {updateEntry.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {journalData.message}
            </p>
            {isOwner && (
              <>
                <Separator />
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    disabled={updateEntry.isPending}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive"
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}