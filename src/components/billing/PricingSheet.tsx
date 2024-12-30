import React from 'react'
import { Tables } from '@database.types';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { Button } from '../ui/button';
import Pricing from './Pricing';
import { User } from '@supabase/supabase-js'
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface PricingSheetProps {
  user: User | null | undefined
  products: ProductWithPrices[] | null
  subscription: SubscriptionWithProduct | null
}

const PricingSheet = ({user, products, subscription}: PricingSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Upgrade</Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:w-full max-w-full sm:max-w-[90vw] lg:max-w-[70vw] text-left'>
        <SheetHeader>
          <SheetTitle>Change subscription plan</SheetTitle>
          <SheetDescription>
            Choose a plan that fits your needs and budget to continue using our service.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex flex-col h-[100vh] pb-32">
       <Pricing user={user} products={products ?? []} subscription={subscription} className='py-4 items-start gap-8 mt-4 mx-0 !px-0' mostPopularProduct='pro' />
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Close</Button>
          </SheetClose>
        </SheetFooter>
        <ScrollBar orientation="vertical" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default PricingSheet