"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@radix-ui/react-scroll-area"

export function TOSDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col backdrop-blur-xl bg-card/80 border-white/20">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-primary border-b pb-4">
            Legal Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-4 font-body text-sm leading-relaxed space-y-8 py-6">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-tight">Terms of Service</h2>
            <p className="font-semibold italic opacity-80">Operated by Versa Front (an alias of an individual operator)</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base">1. Acceptance of Terms</h3>
                <p>By accessing or using Gawa Tara?, you agree to be bound by these Terms of Service. If you do not agree, you must not use the service.</p>
              </div>

              <div>
                <h3 className="font-bold text-base">2. Description of Service</h3>
                <p>Gawa Tara? is a web-based task planning and scheduling system that allows users to create, manage, and organize tasks based on deadlines, priorities, and estimated effort.</p>
              </div>

              <div>
                <h3 className="font-bold text-base">3. Operator Identity</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>“Versa Front” is not a registered company.</li>
                  <li>It is an alias used by an individual operator.</li>
                  <li>All responsibilities, liabilities, and control over the service reside with the individual behind this alias.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">4. User Account and Authentication</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access requires authentication via a Google Account.</li>
                  <li>By signing in, you authorize access to your email address and basic profile information.</li>
                  <li>You are responsible for your account usage.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">5. Data Collection and Retention</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All user-inputted data (tasks, schedules, and related inputs) is stored.</li>
                  <li>Data is retained indefinitely.</li>
                  <li>The operator reserves full discretion over retention, deletion, or handling of data.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">6. Service Availability and Termination</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The service may be modified, suspended, or terminated at any time without notice.</li>
                  <li>Termination may be abrupt.</li>
                  <li>Data may become permanently inaccessible upon termination.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">7. User Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No misuse, abuse, or unauthorized access attempts.</li>
                  <li>You are responsible for all data you input.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">8. Limitation of Liability</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provided “as is” without warranties.</li>
                  <li>No liability for data loss, downtime, or damages arising from use or unavailability.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">9. Modifications to Terms</h3>
                <p>These Terms may change at any time. Continued use constitutes acceptance.</p>
              </div>
            </div>
          </section>

          <div className="h-px bg-border my-8" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-tight">Privacy Policy</h2>
            <p className="font-semibold italic opacity-80">Operated by Versa Front (an alias of an individual operator)</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base">1. Information Collected</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google Account data: email and basic profile information.</li>
                  <li>User-generated data: tasks, schedules, and system inputs.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">2. Use of Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Account creation and authentication.</li>
                  <li>Service operation and data storage.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">3. Google Account Consent</h3>
                <p>By using the service, you consent to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access to your Google email and profile data.</li>
                  <li>Use of this data for authentication and identification.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">4. Data Retention</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All data is stored indefinitely.</li>
                  <li>Data may persist even if the service is discontinued.</li>
                  <li>No obligation to delete or return data.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">5. Data Security</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reasonable safeguards may be used.</li>
                  <li>No guarantee of security.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">6. Data Sharing</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No sale of user data.</li>
                  <li>Disclosure only if required by law or necessary to enforce terms.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">7. Service Discontinuation</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The service may stop at any time without notice.</li>
                  <li>Data may be permanently lost.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">8. Data Controller Disclosure</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The data controller operates under the alias “Versa Front.”</li>
                  <li>This is not a registered legal entity.</li>
                  <li>Responsibility lies with the individual operator behind the alias.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base">9. Changes to Policy</h3>
                <p>Policy may change at any time. Continued use constitutes acceptance.</p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
