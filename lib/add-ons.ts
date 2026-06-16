import { supabase } from './supabase'

export interface AddOn {
  id: string
  name: string
  price: number
  description: string | null
  created_at: string
}

export interface AddOnInput {
  name: string
  price: number
  description: string | null
}

// Fetch all add-ons
export async function getAddOns() {
  const { data, error } = await supabase.from('add_ons').select('*').order('created_at', { ascending: false })
  return { data, error }
}

// Fetch single add-on
export async function getAddOn(id: string) {
  const { data, error } = await supabase.from('add_ons').select('*').eq('id', id).single()
  return { data, error }
}

// Create add-on
export async function createAddOn(addOn: AddOnInput) {
  const { data, error } = await supabase.from('add_ons').insert(addOn).select().single()
  return { data, error }
}

// Update add-on
export async function updateAddOn(id: string, addOn: Partial<AddOnInput>) {
  const { data, error } = await supabase.from('add_ons').update(addOn).eq('id', id).select().single()
  return { data, error }
}

// Delete add-on
export async function deleteAddOn(id: string) {
  const { error } = await supabase.from('add_ons').delete().eq('id', id)
  return { error }
}
