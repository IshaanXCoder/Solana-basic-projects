'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudDappProgram } from './counter-data-access'
import { CrudCreate, CrudList } from './counter-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { BookOpen, PenTool, Users, Shield } from 'lucide-react'

export default function CrudFeature() {
  const { publicKey } = useWallet()
  const { programId } = useCrudDappProgram()

  return publicKey ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AppHero
        title="Journal DApp"
        subtitle={
          'Share your thoughts, experiences, and stories on the blockchain. Create immutable journal entries that are stored on-chain and can be updated or deleted by their owners. Your digital diary, secured by Solana.'
        }
      >
        <div className="space-y-6">
          {/* Program Info */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Program Address:</p>
            <ExplorerLink 
              path={`account/${programId}`} 
              label={ellipsify(programId.toString())} 
              className="font-mono text-blue-600 hover:text-blue-800 transition-colors duration-200"
            />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Create</h3>
              <p className="text-xs text-gray-600">Write entries</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200 text-center">
              <PenTool className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Edit</h3>
              <p className="text-xs text-gray-600">Update anytime</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Share</h3>
              <p className="text-xs text-gray-600">Public stories</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-orange-200 text-center">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Secure</h3>
              <p className="text-xs text-gray-600">On-chain data</p>
            </div>
          </div>
          
          <CrudCreate />
        </div>
      </AppHero>
      
      <div className="container mx-auto px-4 pb-16">
        <CrudList />
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-blue-200 shadow-xl">
          <div className="mb-8">
            <BookOpen className="h-24 w-24 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Journal DApp
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your personal blockchain-powered journal. Share stories, preserve memories, 
              and connect with others through immutable entries stored on Solana.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Create Entries</h3>
              <p className="text-sm text-gray-600">Write and publish your thoughts securely on-chain</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PenTool className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Edit & Update</h3>
              <p className="text-sm text-gray-600">Modify your entries while maintaining ownership</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600">Your data is protected by blockchain technology</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
            <h3 className="text-xl font-semibold mb-3">Ready to start journaling?</h3>
            <p className="text-blue-100 mb-6">
              Connect your Solana wallet to begin creating your first journal entry. 
              Your stories will be permanently stored on the blockchain.
            </p>
            <WalletButton className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg" />
          </div>
          
          <div className="text-sm text-gray-500">
            <p>🔒 Your wallet, your data, your stories</p>
          </div>
        </div>
      </div>
    </div>
  )
}