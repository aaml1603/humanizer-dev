"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowRight, Copy, RotateCcw, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { humanizeService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function HumanizePage() {
  const { user, refreshUserInfo } = useAuth()
  const { toast } = useToast()
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [humanLevel, setHumanLevel] = useState([50])
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [progress, setProgress] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [isOverLimit, setIsOverLimit] = useState(false)

  // Calculate words used and remaining
  const wordsUsed = user?.words_used || 0
  const wordsRemaining = user ? user.word_limit - wordsUsed : 0

  useEffect(() => {
    // Only refresh if user data is missing
    if (!user) {
      refreshUserInfo(false) // Don't force refresh
    }
  }, [refreshUserInfo, user])

  useEffect(() => {
    // Count words in input text
    const count = inputText ? inputText.trim().split(/\s+/).length : 0
    setWordCount(count)

    // Check if over limit
    setIsOverLimit(count > wordsRemaining)
  }, [inputText, wordsRemaining])

  const handleHumanize = async () => {
    if (!inputText.trim() || isOverLimit) return

    setIsLoading(true)
    setProgress(0)

    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 5
      })
    }, 100)

    try {
      // Call the actual API
      const result = await humanizeService.humanizeText({
        text: inputText,
        description: `Text humanization (${humanLevel}% human-like)`,
      })

      // Complete the progress
      clearInterval(interval)
      setProgress(100)

      // Update the output
      setOutputText(result.humanized_text)

      // Refresh user info to get updated word count
      await refreshUserInfo(true) // Force refresh after humanization

      toast({
        title: "Humanization complete",
        description: `Successfully humanized ${result.word_count} words`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Humanization failed",
        description: error.message || "An error occurred while humanizing your text",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    toast({
      title: "Copied to clipboard",
      description: "The humanized text has been copied to your clipboard",
    })
  }

  const handleReset = () => {
    setInputText("")
    setOutputText("")
    setProgress(0)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-medium">AI Content Humanizer</h1>
        <p className="text-muted-foreground">
          Transform AI-generated content into human-like text that bypasses AI detectors.
        </p>

        {user && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="text-sm">
              <span className="font-medium">Plan: </span>
              <span className="capitalize">{user.membership}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Words Remaining: </span>
              <span>
                {wordsRemaining.toLocaleString()} / {user.word_limit.toLocaleString()}
                {user.membership === "free" ? " (resets daily)" : ""}
              </span>
            </div>
          </div>
        )}

        {isOverLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Word Limit Exceeded</AlertTitle>
            <AlertDescription>
              Your text exceeds your remaining word limit. Please reduce the text length or upgrade your plan.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="min-h-[300px] md:min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>AI-Generated Text</CardTitle>
                  <CardDescription>Paste your AI-generated content here</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <Textarea
                    placeholder="Paste your AI-generated text here..."
                    className="min-h-[200px] md:min-h-[250px] flex-1 resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    {wordCount > 0 ? (
                      <span className={isOverLimit ? "text-destructive" : ""}>
                        {wordCount} words {isOverLimit ? "(exceeds limit)" : ""}
                      </span>
                    ) : (
                      "0 words"
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </CardFooter>
              </Card>

              <Card className="min-h-[300px] md:min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>Humanized Text</CardTitle>
                  <CardDescription>Your humanized content will appear here</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">Humanizing your content...</p>
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Humanized text will appear here..."
                      className="min-h-[200px] md:min-h-[250px] flex-1 resize-none"
                      value={outputText}
                      readOnly
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    {outputText ? `${outputText.split(/\s+/).length} words` : "0 words"}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!outputText}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Humanization Settings</CardTitle>
                <CardDescription>Customize how your content is humanized</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Human-like Level</Label>
                    <span className="text-sm text-muted-foreground">{humanLevel}%</span>
                  </div>
                  <Slider value={humanLevel} onValueChange={setHumanLevel} max={100} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Natural</span>
                    <span>More Human-like</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserve-formatting"
                    checked={preserveFormatting}
                    onCheckedChange={setPreserveFormatting}
                  />
                  <Label htmlFor="preserve-formatting">Preserve formatting (paragraphs, lists, etc.)</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleHumanize}
                  disabled={isLoading || !inputText.trim() || isOverLimit}
                >
                  {isLoading ? (
                    "Humanizing..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Humanize Content
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="document" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Upload a document to humanize its content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-muted-foreground"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">Supported formats: DOCX, PDF, TXT (Max 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" />
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Upload and Humanize
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

