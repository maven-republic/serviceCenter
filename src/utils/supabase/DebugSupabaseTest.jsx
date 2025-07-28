// Create this as a temporary test component
// Save as: src/components/DebugSupabaseTest.jsx

'use client'

import { useState } from 'react'
import { useAuth } from '@/components/ClientProviders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugSupabaseTest() {
  const { supabase, session } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test, success, data, error, duration) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data,
      error: error?.message || error,
      duration,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runTest = async (testName, testFn) => {
    console.log(`🧪 Running test: ${testName}`)
    const start = Date.now()
    setIsLoading(true)
    
    try {
      const result = await testFn()
      const duration = Date.now() - start
      addResult(testName, true, result, null, duration)
      console.log(`✅ Test passed: ${testName} (${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - start
      addResult(testName, false, null, error, duration)
      console.error(`❌ Test failed: ${testName} (${duration}ms)`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const tests = [
    {
      name: "1. Basic Connection Test",
      fn: async () => {
        const { data, error } = await supabase.from('account').select('count', { count: 'exact', head: true })
        if (error) throw error
        return `Connection successful, ~${data} rows`
      }
    },
    {
      name: "2. Simple Select Test", 
      fn: async () => {
        const { data, error } = await supabase.from('account').select('email').limit(1)
        if (error) throw error
        return `Query successful, found ${data.length} rows`
      }
    },
    {
      name: "3. Specific Email Test",
      fn: async () => {
        const { data, error } = await supabase
          .from('account')
          .select('account_id, email')
          .eq('email', 'andre.ronpaul@gmail.com')
          .single()
        if (error) throw error
        return `Found account: ${data.account_id}`
      }
    },
    {
      name: "4. Auth User Test",
      fn: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return `Auth user: ${user?.email || 'No user'}`
      }
    },
    {
      name: "5. Session Test",
      fn: async () => {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        return `Session: ${currentSession?.user?.email || 'No session'}`
      }
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Supabase Client Debug Tests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Run these tests to isolate the Supabase client issue
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tests.map((test, index) => (
            <Button 
              key={index}
              onClick={() => runTest(test.name, test.fn)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {test.name}
            </Button>
          ))}
          <Button 
            onClick={() => setTestResults([])}
            variant="destructive"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded border text-sm ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">
                  {result.success ? '✅' : '❌'} {result.test}
                </span>
                <span className="text-xs opacity-70">
                  {result.duration}ms at {result.timestamp}
                </span>
              </div>
              {result.success ? (
                <div className="mt-1 text-xs">
                  Result: {JSON.stringify(result.data)}
                </div>
              ) : (
                <div className="mt-1 text-xs">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Session:</strong> {session?.user?.email || 'No session'}</p>
          <p><strong>Supabase Client:</strong> {supabase ? 'Available' : 'Not available'}</p>
        </div>
      </CardContent>
    </Card>
  )
}