import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Rocket, CheckCircle2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  insertAcceleratorSchema,
  projectStageValues,
  teamSizeValues,
  buildingCategoryValues,
  type InsertAcceleratorApplication,
} from "@shared/schema";

export default function AcceleratorApply() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertAcceleratorApplication>({
    resolver: zodResolver(insertAcceleratorSchema),
    defaultValues: {
      name: "",
      email: "",
      projectName: "",
      website: "",
      twitter: "",
      github: "",
      description: "",
      projectStage: "",
      teamSize: "",
      category: "",
      howCanWeHelp: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: InsertAcceleratorApplication) =>
      apiRequest("POST", "/api/accelerator", data),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: async (err: any) => {
      let msg = "Something went wrong. Please try again.";
      try {
        const body = await err.response?.json?.();
        if (body?.error && typeof body.error === "string") msg = body.error;
      } catch {}
      toast({ title: "Submission failed", description: msg, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navigation />
        <main className="pt-32 pb-20 flex items-center justify-center">
          <Card className="max-w-lg w-full mx-4 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-3" data-testid="heading-submitted">
              Application Received
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Thank you for applying to the Liberty Accelerator. Our team will review your
              application and reach out via email within 2–3 weeks.
            </p>
            <Button asChild className="w-full">
              <Link href="/build">Back to Build</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6">

          {/* Back */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" asChild>
              <Link href="/build">
                <ChevronLeft className="w-4 h-4" />
                Build
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <Rocket className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Liberty Accelerator</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-apply">
              Apply Now
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Get funding, mentorship, and resources to launch your project on Liberty Chain.
              Applications are reviewed quarterly.
            </p>
          </div>

          {/* Form */}
          <Card className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))}
                className="space-y-6"
                data-testid="form-accelerator"
              >
                {/* Contact */}
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Contact
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Smith" data-testid="input-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane@project.xyz" data-testid="input-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Project basics */}
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Project
                  </h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome DApp" data-testid="input-project-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="What are you building?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {buildingCategoryValues.map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Stage *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-project-stage">
                                  <SelectValue placeholder="Current stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projectStageValues.map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Size *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-team-size">
                                  <SelectValue placeholder="How big is your team?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamSizeValues.map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://myproject.xyz" data-testid="input-website" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>X / Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="@handle" data-testid="input-twitter" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="github"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub</FormLabel>
                            <FormControl>
                              <Input placeholder="github.com/myproject" data-testid="input-github" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us what you're building, the problem you're solving, and your vision..."
                              className="resize-none min-h-[120px]"
                              data-testid="textarea-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="howCanWeHelp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How Can Liberty Chain Help? *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What kind of support, funding, or mentorship are you looking for?"
                              className="resize-none min-h-[100px]"
                              data-testid="textarea-how-can-we-help"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  );
}
