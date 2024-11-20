"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateCategorySchemaType, CreateCategorySchema } from "@/schema/categories";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/app/(dashboard)/_actions/categories";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Props {
  type: TransactionType;
  successCallback: (category: Category) => void;
  trigger?: ReactNode;
}

function CreateCategoryDialog({ type, successCallback, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    },
  })

  const queryClient = useQueryClient();
  const theme = useTheme();

  const { mutate, isPending } = useMutation({
    mutationFn: createCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });

      toast.success(`Category ${data.name} created successfully 🎉`, {
        id: "create-category",
      });

      successCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      });

      setOpen((prev) => !prev);

    },
    onError: (error) => {
      toast.error("Something went wrong", {
        id: "create-category",
      });
      console.error(error);
    },
  })

  const onSubmit = useCallback(
    (values: CreateCategorySchemaType) => {
      console.log("Form submitted with values:", values); // Debugging log
      toast.loading("Creating category...", {
        id: "create-category",
      });
      mutate(values);
    },
    [mutate]
  );

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      { trigger ? (
        trigger ) : (<Button variant={'ghost'}
        className='flex border-separate items-center jusitfy-left rounded-none border-b px-3 py-3 text-muted-foreground'>
        <PlusSquare className='mr-2 h-4 w-4' />
        Create new
      </Button>
    )}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Create <span className={cn(
            "m-1",
            type === "income" ? "text-emerald-500" : "text-red-500"
          )}
          >
            {type}
          </span>
        </DialogTitle>
        <DialogDescription>
          Categories are used to group your transactions
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Set a name for your category
                </FormDescription>
              </FormItem>

            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className='h-[100px] w-full'>
                        {form.watch('icon') ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-5xl" role='img'>{field.value}</span>
                            <p className="text-xs text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <CircleOff className='h-[48px] w-[48px]' />
                            <p className="text-xs text-muted-foreground">Click to select</p>
                          </div>

                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-full max-h-[300px] '>
                      <Picker data={data}
                        theme={theme.resolvedTheme}
                        onEmojiSelect={(emoji: { native: string }) => {
                          field.onChange(emoji.native);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  This is how your category will be displayed
                </FormDescription>
              </FormItem>

            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={'secondary'} onClick={() => {
            form.reset();
          }}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
          {!isPending && "Create"}
          {isPending && <Loader2 className='animate-spin' />}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

export default CreateCategoryDialog;

function zodResovler(CreateCategorySchema: any): import("react-hook-form").Resolver<CreateCategorySchemaType, any> | undefined {
  throw new Error("Function not implemented.");
}
