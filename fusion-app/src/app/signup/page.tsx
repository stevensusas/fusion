import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "../../components/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10 min-h-svh">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Fusion
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}
