'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserCalculations, deleteCalculation, toggleFavorite } from '@/lib/calculator-storage';
import type { Calculation } from '@/lib/supabase-client';
import { Trash2, Star, Calculator, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MyCalculationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loadingCalculations, setLoadingCalculations] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/my-calculations');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadCalculations();
    }
  }, [user]);

  const loadCalculations = async () => {
    try {
      setLoadingCalculations(true);
      const data = await getUserCalculations();
      setCalculations(data);
    } catch (error) {
      console.error('Failed to load calculations:', error);
    } finally {
      setLoadingCalculations(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return;
    
    try {
      await deleteCalculation(id);
      setCalculations(calculations.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      alert('Failed to delete calculation');
    }
  };

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      await toggleFavorite(id, !currentFavorite);
      setCalculations(calculations.map(c => 
        c.id === id ? { ...c, is_favorite: !currentFavorite } : c
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  const filteredCalculations = filter === 'all' 
    ? calculations 
    : filter === 'favorites'
    ? calculations.filter(c => c.is_favorite)
    : calculations.filter(c => c.calculator_type === filter);

  const uniqueTypes = Array.from(new Set(calculations.map(c => c.calculator_type)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCalculatorName = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Calculations</h1>
            <p className="text-muted-foreground">View and manage all your saved calculations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-3xl font-bold">{calculations.length}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                    <p className="text-3xl font-bold">{calculations.filter(c => c.is_favorite).length}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Calculator Types</p>
                    <p className="text-3xl font-bold">{uniqueTypes.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All ({calculations.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({calculations.filter(c => c.is_favorite).length})</TabsTrigger>
              {uniqueTypes.slice(0, 3).map(type => (
                <TabsTrigger key={type} value={type}>
                  {formatCalculatorName(type)} ({calculations.filter(c => c.calculator_type === type).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Calculations List */}
          {loadingCalculations ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calculations...</p>
            </div>
          ) : filteredCalculations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calculations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start using our calculators and save your results
                </p>
                <Button asChild>
                  <Link href="/calculators">Browse Calculators</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCalculations.map((calc) => (
                <Card key={calc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">
                            {formatCalculatorName(calc.calculator_type)}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(calc.id, calc.is_favorite)}
                            className="h-8 w-8 p-0"
                          >
                            <Star 
                              className={`h-4 w-4 ${calc.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                            />
                          </Button>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(calc.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/calculators/${calc.calculator_type}`}>
                            View Calculator
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(calc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Inputs</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {Object.entries(calc.inputs).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium text-foreground">
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </span>
                            </div>
                          ))}
                          {Object.keys(calc.inputs).length > 3 && (
                            <p className="text-xs italic">+{Object.keys(calc.inputs).length - 3} more...</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Results</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {Object.entries(calc.results).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium text-foreground">
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </span>
                            </div>
                          ))}
                          {Object.keys(calc.results).length > 3 && (
                            <p className="text-xs italic">+{Object.keys(calc.results).length - 3} more...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
