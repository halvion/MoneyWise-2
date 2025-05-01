// components/FamilySwitch.tsx
"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { UpdateUserModeSchema } from "@/schema/userSettings";
import { UpdateUserMode } from "@/app/wizard/_actions/userSettings";
import { mode } from "@/lib/mode";

async function fetchUserSettings() {
  const response = await fetch("/api/user-settings");
  if (!response.ok) {
    throw new Error("Failed to fetch user settings");
  }
  return response.json();
}

export function FamilySwitch() {
  const { data: userSettings, isLoading, error } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserSettings,
  });
  const mutation = useMutation({
    mutationFn: UpdateUserMode,
  });

  const form = useForm({
    resolver: zodResolver(UpdateUserModeSchema),
    defaultValues: {
      mode: "Individual",
    },
  });

  useEffect(() => {
    if (userSettings) {
      form.setValue("mode", userSettings.mode);
    }
  }, [userSettings, form]);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "Family" : "Individual";
    form.setValue("mode", newMode);
    mutation.mutate(newMode);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user settings</div>;

  return (
    <div className="flex items-center justify-between">
      <Switch
        checked={form.watch("mode") === "Family"}
        onCheckedChange={handleModeChange}
      />
    </div>
  );
}