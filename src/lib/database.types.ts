export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mandats: {
        Row: {
          id: string
          created_at: string
          date: string
          type: 'exclusive' | 'simple' | 'semi-exclusive'
          net_price: number
          fees_ttc: number
          fees_ht: number
          fees_payer: 'seller' | 'buyer'
          commercial: string
          keys: Json
          amendments: Json[]
          purchase_offers: Json[]
        }
        Insert: {
          id: string
          created_at?: string
          date: string
          type: 'exclusive' | 'simple' | 'semi-exclusive'
          net_price: number
          fees_ttc: number
          fees_ht: number
          fees_payer: 'seller' | 'buyer'
          commercial: string
          keys?: Json
          amendments?: Json[]
          purchase_offers?: Json[]
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          type?: 'exclusive' | 'simple' | 'semi-exclusive'
          net_price?: number
          fees_ttc?: number
          fees_ht?: number
          fees_payer?: 'seller' | 'buyer'
          commercial?: string
          keys?: Json
          amendments?: Json[]
          purchase_offers?: Json[]
        }
      }
      estimations: {
        Row: {
          // ... (garder le reste du code existant pour la table estimations)
        }
        Insert: {
          // ... (garder le reste du code existant pour la table estimations)
        }
        Update: {
          // ... (garder le reste du code existant pour la table estimations)
        }
      }
    }
  }
}